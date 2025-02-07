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


export const findAppointmentsWithAI: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'findAppointmentsWithAI',
  category: Category.EHR_INTEGRATIONS,
  title: '🪄 Find Appointments with AI',
  description: 'Find all appointments for a patient using natural language.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const { prompt, patientId } = FieldsValidationSchema.parse(payload.fields)
    const api = makeAPIClient(payload.settings)

    // First fetch all appointments for the patient
    const appointments = await api.findAppointments({
      patient: patientId,
    })

    // Early return if no appointments found
    if (isNil(appointments) || appointments.length === 0) {
      await onComplete({
        data_points: {
          explanation: 'No appointments found',
          appointments: JSON.stringify([]),
          appointmentCountsByStatus: JSON.stringify({}),
        },
      })
      return
    }

    try {
      // Initialize OpenAI model for natural language processing
      const { model, metadata, callbacks } = await createOpenAIModel({
        settings: {}, // we use built-in API key for OpenAI
        helpers,
        payload,
      })

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
      const selectedAppointments = appointments.filter((appointment) =>
        appointmentIds.includes(appointment.id),
      )

      const appointmentCountsByStatus =
        getAppointmentCountsByStatus(selectedAppointments)

      await onComplete({
        data_points: {
          appointments: JSON.stringify(selectedAppointments),
          explanation: htmlExplanation,
          appointmentCountsByStatus: JSON.stringify(appointmentCountsByStatus),
        },
        events: [
          addActivityEventLog({
            message: `Found ${selectedAppointments.length} appointments for patient ${patientId}`,
          }),
        ],
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
