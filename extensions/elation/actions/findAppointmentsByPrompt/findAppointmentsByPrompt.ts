import { isNil } from 'lodash'
import { type Action, Category } from '@awell-health/extensions-core'

import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'
import { type settings } from '../../settings'
import { makeAPIClient } from '../../client'
import { findMatchingAppointments } from './findAppoitnmentsWithAi'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import { getAppointmentCountsByStatus } from './getAppoitnmentCountByStatus'
import { type AppointmentResponse } from 'extensions/elation/types'

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
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const { prompt, patientId } = FieldsValidationSchema.parse(payload.fields)
    const api = makeAPIClient(payload.settings)

    const openAiConfig = helpers.getOpenAIConfig()

    const apiKey = !isNil(payload.settings.openAiApiKey)
      ? payload.settings.openAiApiKey
      : openAiConfig.apiKey

    // log which api key is being used
    console.info(
      `Using ${!isNil(payload.settings.openAiApiKey) ? 'client custom' : 'Awell'} Open AI API key for findFutureAppointment action ${patientId}`,
    )

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

    const { explanation, appointmentIds } = await findMatchingAppointments({
      apiKey,
      openAiConfig,
      appointments,
      prompt,
    })

    const selectedAppointments: AppointmentResponse[] = appointments.filter(
      (appointment) => appointmentIds.includes(String(appointment.id)),
    )

    if (Object.keys(selectedAppointments).length === 0) {
      console.log('No appointments found')
      await onComplete({
        data_points: {
          explanation,
        },
      })
      return
    }
    if (selectedAppointments.length !== appointmentIds.length) {
      console.log('Some appointments were not found')
      const errorMessage = `Some appointments were not found. Found ${selectedAppointments.length} appointments, but the prompt resulted in ${appointmentIds.length} appointments.`
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
          message: `Found ${selectedAppointments.length} appointments for patient ${patientId}\nExplanation: ${explanation}\nAppointment counts by status: ${JSON.stringify(appointmentCountsByStatus)}`,
        }),
      ],
    })
  },
}
