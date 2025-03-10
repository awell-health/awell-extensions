import { isNil } from 'lodash'
import { type Action, Category } from '@awell-health/extensions-core'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'
import { type settings } from '../../settings'
import { makeAPIClient } from '../../client'
import { createOpenAIModel } from '../../../../src/lib/llm/openai/createOpenAIModel'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import { getAppointmentCountsByStatus } from './getAppoitnmentCountByStatus'
import { findAppointmentsWithLLM } from '../../lib/findAppointmentsWithLLM/findAppointmentsWithLLM'
import { markdownToHtml } from '../../../../src/utils'
import { isAfter, isBefore, parseISO } from 'date-fns'
import { extractDatesFromInstructions } from '../../lib/extractDatesFromInstructions/extractDatesFromInstructions'
import { type DateFilterFromLLM } from '../../lib/extractDatesFromInstructions/parser'
import { OPENAI_MODELS } from '../../../../src/lib/llm/openai/constants'

export const findAppointmentsWithAI: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'findAppointmentsWithAI',
  category: Category.EHR_INTEGRATIONS,
  title: '✨ Find Appointments',
  description: 'Find all appointments for a patient using natural language.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const { prompt, patientId, dateFilterPrompt } =
      FieldsValidationSchema.parse(payload.fields)
    const api = makeAPIClient(payload.settings)

    try {
      // Initialize OpenAI model for natural language processing
      const { model, metadata, callbacks } = await createOpenAIModel({
        modelType: OPENAI_MODELS.GPT4o, // GPT4oMini is not reliable enough to work with dates.
        settings: {},
        helpers,
        payload,
      })

      let dateFilter: DateFilterFromLLM = {
        from: undefined,
        to: undefined,
      }
      if (!isNil(dateFilterPrompt)) {
        dateFilter = await extractDatesFromInstructions({
          model,
          prompt: dateFilterPrompt,
          metadata,
          callbacks,
        })
      }

      // First fetch all appointments for the patient
      const appointments = await api.findAppointments({
        patient: patientId,
      })

      // Early return if no appointments found
      if (isNil(appointments) || appointments.length === 0) {
        await onComplete({
          data_points: {
            explanation: 'No appointments found for the given patient',
            appointments: JSON.stringify([]),
            appointmentCountsByStatus: JSON.stringify({}),
          },
        })
        return
      }

      // Use LLM to find appointments matching the user's natural language prompt
      const { appointmentIds, explanation } = await findAppointmentsWithLLM({
        model,
        appointments,
        prompt,
        metadata,
        callbacks,
      })

      const htmlExplanation = await markdownToHtml(explanation)

      // Filter appointments based on LLM's selection
      const selectedAppointments = appointments.filter(
        (appointment) =>
          appointmentIds.includes(appointment.id) &&
          (isNil(dateFilter.from) ||
            isAfter(
              parseISO(appointment.scheduled_date),
              parseISO(dateFilter.from),
            )) &&
          (isNil(dateFilter.to) ||
            isBefore(
              parseISO(appointment.scheduled_date),
              parseISO(dateFilter.to),
            )),
      )

      const appointmentCountsByStatus =
        getAppointmentCountsByStatus(selectedAppointments)

      const events = [
        addActivityEventLog({
          message: `Found ${appointmentIds.length} appointments for patient ${patientId} that match the search instructions.`,
        }),
      ]
      if (!isNil(dateFilter.from) && !isNil(dateFilter.to)) {
        events.push(
          addActivityEventLog({
            message: `Narrowed down to ${selectedAppointments.length} appointments scheduled between ${dateFilter.from} and ${dateFilter.to}.`,
          }),
        )
      } else if (!isNil(dateFilter.from)) {
        events.push(
          addActivityEventLog({
            message: `Narrowed down to ${selectedAppointments.length} appointments scheduled after ${dateFilter.from}.`,
          }),
        )
      } else if (!isNil(dateFilter.to)) {
        events.push(
          addActivityEventLog({
            message: `Narrowed down to ${selectedAppointments.length} appointments scheduled before ${dateFilter.to}.`,
          }),
        )
      }
      await onComplete({
        data_points: {
          appointments: JSON.stringify(selectedAppointments),
          explanation: htmlExplanation,
          appointmentCountsByStatus: JSON.stringify(appointmentCountsByStatus),
        },
        events,
      })
    } catch (error) {
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: 'Failed to find appointments' },
            error: {
              category: 'SERVER_ERROR',
              message: error instanceof Error ? error.message : 'Unknown error',
            },
          },
        ],
      })
    }
  },
}
