import { isNil } from 'lodash'
import { type Action, Category } from '@awell-health/extensions-core'

import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'
import type { settings, SettingsType } from '../../settings'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import { getFutureAppointments } from './getFutureAppoitnments'
import { AppointmentIdSchema } from './config/types'
import { findMatchingAppointment } from './findAppoitnmentsWithAi'

export const findFutureAppointment: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'findFutureAppointment',
  category: Category.EHR_INTEGRATIONS,
  title: '🪄 Find future appointment',
  description: 'Find a future appointment in Elation.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const { prompt, patientId } = FieldsValidationSchema.parse(payload.fields)

    const openAiConfig = helpers.getOpenAIConfig()

    const apiKey = !isNil(payload.settings.openAiApiKey)
      ? payload.settings.openAiApiKey
      : openAiConfig.apiKey

    // log which api key is being used
    console.info(
      `Using ${!isNil(payload.settings.openAiApiKey) ? 'client custom' : 'Awell'} Open AI API key for findFutureAppointment action ${patientId}`,
    )

    const appointments = await getFutureAppointments(
      payload.settings as SettingsType,
      patientId,
    )

    if (appointments.length === 0) {
      await onComplete({
        data_points: {
          appointmentExists: 'false',
        },
      })
      return
    }

    const { appointmentId, explanation } = await findMatchingAppointment({
      apiKey,
      openAiConfig,
      prompt,
      appointments,
    })

    const matchedAppointmentId = AppointmentIdSchema.parse(appointmentId)

    const foundAppointment = appointments.find(
      (appointment) => appointment.id === Number(matchedAppointmentId),
    )

    await onComplete({
      data_points: {
        appointment: !isNil(matchedAppointmentId)
          ? JSON.stringify(foundAppointment)
          : undefined,
        explanation,
        appointmentExists: !isNil(matchedAppointmentId) ? 'true' : 'false',
      },
      events: [
        addActivityEventLog({
          message: `Number of future scheduled or confirmed appointments for patient ${patientId}: ${appointments.length}\nFound appointment: ${isNil(foundAppointment) ? 'none' : foundAppointment?.id}\nExplanation: ${explanation}`,
        }),
      ],
    })
  },
}
