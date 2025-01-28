import { isNil } from 'lodash'
import { type Action, Category } from '@awell-health/extensions-core'

import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'
import type { settings, SettingsType } from '../../settings'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import { getFutureAppointments } from './getFutureAppoitnments'
import { AppointmentIdSchema } from './lib/findAppointmentWithLLM/parser'
import { findAppointmentWithLLM } from './lib/findAppointmentWithLLM/findAppointmentWithLLM'
import { createOpenAIModel } from '../../../../src/lib/llm/openai/createOpenAIModel'
import { OPENAI_MODELS } from '../../../../src/lib/llm/openai/constants'

export const findFutureAppointment: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'findFutureAppointment',
  category: Category.EHR_INTEGRATIONS,
  title: '🪄 Find future appointment (Beta)',
  description: 'Find a future appointment in Elation.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    // 1. Validate input
    const { prompt, patientId } = FieldsValidationSchema.parse(payload.fields)

    // 2. Get future appointments
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

    // 3. Initialize OpenAI model with metadata and callbacks
    const { model, metadata, callbacks } = await createOpenAIModel({
      settings: {}, // we use built-in API key for OpenAI
      helpers,
      payload,
      modelType: OPENAI_MODELS.GPT4o,
    })

    // 4. Find matching appointment
    const { appointmentId, explanation } = await findAppointmentWithLLM({
      model,
      appointments,
      prompt,
      metadata,
      callbacks,
    })

    const matchedAppointmentId = AppointmentIdSchema.parse(appointmentId)
    const foundAppointment = appointments.find(
      (appointment) => appointment.id === Number(matchedAppointmentId),
    )

    // 5. Complete action with results
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
