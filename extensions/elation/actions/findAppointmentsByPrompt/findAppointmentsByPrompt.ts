import { isNil } from 'lodash'
import { type Action, Category } from '@awell-health/extensions-core'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'
import { type settings } from '../../settings'
import { makeAPIClient } from '../../client'
import { createOpenAIModel } from '../../../../src/lib/llm/openai/createOpenAIModel'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import { getAppointmentCountsByStatus } from './getAppoitnmentCountByStatus'
import { findAppointmentsByPromptWithLLM } from './lib/findAppointmentsByPromptWithLLM/findAppointmentsByPromptWithLLM'

export const findAppointmentsByPrompt: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'findAppointmentsByPrompt',
  category: Category.EHR_INTEGRATIONS,
  title: '🪄 Find Appointments by Prompt (Beta)',
  description: 'Find all appointments for a patient using natural language.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const { prompt, patientId } = FieldsValidationSchema.parse(payload.fields)
    const api = makeAPIClient(payload.settings)

    const appointments = await api.findAppointments({
      patient: patientId,
    })

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
      const { model, metadata, callbacks } = await createOpenAIModel({
        settings: {}, // we use built-in API key for OpenAI
        helpers,
        payload,
      })

      const { appointmentIds, explanation } =
        await findAppointmentsByPromptWithLLM({
          model,
          appointments,
          prompt,
          metadata,
          callbacks,
        })

      const selectedAppointments = appointments.filter((appointment) =>
        appointmentIds.includes(appointment.id),
      )

      const appointmentCountsByStatus =
        getAppointmentCountsByStatus(selectedAppointments)

      await onComplete({
        data_points: {
          appointments: JSON.stringify(selectedAppointments),
          explanation,
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
