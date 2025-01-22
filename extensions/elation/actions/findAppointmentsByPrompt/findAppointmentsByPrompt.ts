import { type Action, Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { makeAPIClient } from '../../client'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import { StructuredOutputParser } from '@langchain/core/output_parsers'
import { z } from 'zod'
import { ChatOpenAI } from '@langchain/openai'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'
import { statusEnum } from '../../validation/appointment.zod'
import { isNil } from 'lodash'

export const findAppointmentsByPrompt: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'findAppointmentsByPrompt',
  category: Category.EHR_INTEGRATIONS,
  title: '🪄 Find Appointments by Prompt',
  description: 'Find all appointments for a patient using natural language.',
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

    const appointments = await api.findAppointments({
      patient: patientId,
    })

    if (isNil(appointments) || appointments.length === 0) {
      await onComplete({
        data_points: {
          explanation: 'No appointments found',
          appointments: JSON.stringify(appointments),
          appointmentCountsByStatus: JSON.stringify({}),
        },
      })
      return
    }

    const promptAppointments = appointments
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
      modelName: 'gpt-4o-2024-08-06',
      openAIApiKey: openAiApiKey,
      temperature: 0,
      maxRetries: 3,
      timeout: 10000,
    })

    const systemPrompt = createSystemPrompt({
      prompt,
      appointments: promptAppointments,
    })

    const AppointmentIdSchema = z.array(z.string())

    const parser = StructuredOutputParser.fromZodSchema(
      z.object({
        appointmentIds: AppointmentIdSchema,
        explanation: z
          .string()
          .describe(
            'A readable explanation of how the appointments were found and why',
          ),
      }),
    )

    let result: z.infer<typeof parser.schema>

    try {
      const chain = ChatModelGPT4o.pipe(parser)
      result = await chain.invoke(systemPrompt)
    } catch (invokeError) {
      console.error(
        'Error invoking ChatModelGPT4o for findFutureAppointment:',
        invokeError,
      )
      throw new Error('Failed to find future appointment.')
    }

    const selectedAppointments = result.appointmentIds.map((appointmentId) =>
      appointments.find(
        (appointment) => appointment.id === Number(appointmentId),
      ),
    )

    if (Object.keys(selectedAppointments).length === 0) {
      console.log('No appointments found')
      await onComplete({
        data_points: {
          explanation: result.explanation,
        },
      })
      return
    }
    if (selectedAppointments.length !== result.appointmentIds.length) {
      console.log('Some appointments were not found')
      const errorMessage = `Some appointments were not found. Found ${selectedAppointments.length} appointments, but the prompt resulted in ${result.appointmentIds.length} appointments.`
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: errorMessage },
            error: {
              category: 'SERVER_ERROR',
              message: errorMessage,
            },
          },
        ],
      })
      return
    }

    const appointmentCountsByStatus = Object.values(statusEnum.Values).reduce(
      (acc, status) => {
        const cnt = selectedAppointments.filter(
          (appointment) => appointment?.status.status === status,
        ).length
        if (cnt > 0) {
          acc[status] = cnt
        }
        return acc
      },
      {} as Record<string, number>,
    )

    await onComplete({
      data_points: {
        appointments: JSON.stringify(selectedAppointments),
        explanation: result.explanation,
        appointmentCountsByStatus: JSON.stringify(appointmentCountsByStatus),
      },
      events: [
        addActivityEventLog({
          message: `Found ${selectedAppointments.length} appointments for patient ${patientId}\nExplanation: ${result.explanation}\nAppointment counts by status: ${JSON.stringify(appointmentCountsByStatus)}`,
        }),
      ],
    })
  },
}

const createSystemPrompt = ({
  prompt,
  appointments,
}: {
  prompt: string
  appointments: string
}) => {
  const currentDate = new Date().getDate()
  return `You are a helpful medical assistant. You will receive a list (array) of appointments for a single patient and instructions about which types of appointments to find. You're supposed to use the information in the list to find appointments that match, if any exist. If no appointments exists that obviously match the instructions, that's a perfectly acceptable outcome. If multiple appointments exist that match the instructions, you should return all of them.
      
      Important instructions:
      - The appointment "reason" is the appointment type.
      - Only include appointment ids that exist in the input array. If no appointments exist that match the instructions, return an empty array.
      - Pay close attention to the instructions. They are intended to have been written by a clinician, for a clinician.
      - Think like a clinician. In other words, "Rx" should match a prescription appointment or follow-up related to a prescription, and "PT" would matchphysical therapy.
      - The current date is ${currentDate}.
----------
Input array: 
${appointments}
----------
Instruction: 
${prompt}
----------

Output a JSON object with the following keys:
1. appointmentIds: array of strings where each string is an appointment_id that matches the instructions (or an empty array if no appointments exist that match the instructions).
2. explanation: A readable explanation of how the appointments were found and why. Or, if no appointments exist that match the instructions, an explanation of why.`
}
