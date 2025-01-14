import { type Action, Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { makeAPIClient } from '../../client'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import { StructuredOutputParser } from '@langchain/core/output_parsers'
import { z } from 'zod'
import { ChatOpenAI } from '@langchain/openai'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'
import { isNil } from 'lodash'

export const findAppointmentByType: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'findAppointmentByType',
  category: Category.EHR_INTEGRATIONS,
  title: '🪄 Find appointment by type',
  description: 'Find a future appointment by type in Elation.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const { prompt, patientId } = FieldsValidationSchema.parse(payload.fields)
    const api = makeAPIClient(payload.settings)

    const openAiApiKey = payload.settings.openAiApiKey

    if (openAiApiKey === undefined || openAiApiKey === '') {
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: 'OpenAI API key is required for this action.' },
            error: {
              category: 'SERVER_ERROR',
              message: 'OpenAI API key is required for this action.',
            },
          },
        ],
      })
      return
    }

    /**
     * This API is paginated but we can assume there are no more than
     * 100 upcoming appointments for a patient.
     */
    const today = new Date().toISOString()
    const appointments = await api.findAppointments({
      patient: patientId,
      from_date: today, // Future appointments only
    })

    const scheduledOrConfirmedAppointments = appointments.filter(
      (appointment) =>
        appointment.status.status === 'Scheduled' ||
        appointment.status.status === 'Confirmed',
    )

    if (scheduledOrConfirmedAppointments.length === 0) {
      await onComplete({
        data_points: {
          appointmentExists: 'false',
        },
      })
      return
    }

    const promptAppointments = scheduledOrConfirmedAppointments
      .map((appointment) => {
        const relevantInfo = {
          id: appointment.id,
          reason: appointment.reason,
          scheduled_date: appointment.scheduled_date,
        }
        return JSON.stringify(relevantInfo)
      })
      .join('\n\n')

    const ChatModelGPT4o = new ChatOpenAI({
      modelName: 'gpt-4o',
      openAIApiKey: openAiApiKey,
      temperature: 0,
      maxRetries: 3,
      timeout: 10000,
    })

    const systemPrompt = `You are a clinical data manager. You will receive a list (array) of appointments for a single patient and instructions about which type of appointment to find. You're supposed to use the information in the list to find an appointment that matches, if one exists. If no appointment exists that obviously matches the instructions, that's a perfectly acceptable outcome.
      
      Important instructions:
      - The appointment "reason" is the appointment type.
      - Pay close attention to the instructions. THey are intended to have been written by a clinician, for a clinician.
      - Think like a clinician. In other words, "Rx" should match a prescription appointment or follow-up related to a prescription.

----------
Input array: 
${promptAppointments}
----------
Instruction: 
${prompt}
----------

Output a JSON object with two keys:
1. appointmentId: The id of the appointment that matches the instructions, if one exists. If no appointment exists that obviously matches, you should return an empty string.
2. explanation: A readable explanation of how the appointment was found and why. Or, if no appointment exists that matches the instructions, an explanation of why.`

    const SingleAppointmentSchema = z.string().describe('A single appointment')

    const parser = StructuredOutputParser.fromZodSchema(
      z.object({
        appointmentId: SingleAppointmentSchema,
        explanation: z
          .string()
          .describe(
            'A readable explanation of how the appointment was found and why',
          ),
      }),
    )

    let result: z.infer<typeof parser.schema>

    try {
      const chain = ChatModelGPT4o.pipe(parser)
      result = await chain.invoke(systemPrompt)
    } catch (invokeError) {
      console.error(
        'Error invoking ChatModelGPT4o for findAppointmentByType:',
        invokeError,
      )
      throw new Error('Failed to find appointment by type.')
    }

    const validatedAppointment = SingleAppointmentSchema.parse(
      result.appointmentId,
    )

    const foundAppointment = scheduledOrConfirmedAppointments.find(
      (appointment) => appointment.id === Number(validatedAppointment),
    )

    await onComplete({
      data_points: {
        appointment: JSON.stringify(foundAppointment),
        explanation: result.explanation,
        appointmentExists: !isNil(foundAppointment) ? 'true' : 'false',
      },
      events: [
        addActivityEventLog({
          message: `Number of future scheduled or confirmed appointments for patient ${patientId}: ${scheduledOrConfirmedAppointments.length}\nFound appointment: ${isNil(foundAppointment) ? 'none' : foundAppointment?.id}\nExplanation: ${result.explanation}`,
        }),
      ],
    })
  },
}
