import { isNil } from 'lodash'
import { type Action, Category } from '@awell-health/extensions-core'

import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'
import type { settings, SettingsType } from '../../settings'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import { getFutureAppointments } from './getFutureAppointments'
import { findAppointmentsWithLLM } from '../../lib/findAppointmentsWithLLM/findAppointmentsWithLLM'
import { createOpenAIModel } from '../../../../src/lib/llm/openai/createOpenAIModel'
import { OPENAI_MODELS } from '../../../../src/lib/llm/openai/constants'
import { markdownToHtml } from '../../../../src/utils'

export const findFutureAppointmentWithAI: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'findFutureAppointmentWithAI',
  category: Category.EHR_INTEGRATIONS,
  title: '🪄 Find Future Appointment with AI',
  description: 'Find a future appointment in Elation.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    // 1. Validate input
    const { prompt, patientId } = FieldsValidationSchema.parse(payload.fields)

    // 2. Get future appointments (scheduled or confirmed)
    const appointments = await getFutureAppointments(
      payload.settings as SettingsType,
      patientId,
    )

    if (appointments.length === 0) {
      await onComplete({
        data_points: {
          appointment: undefined,
          appointmentExists: 'false',
          explanation: 'No future appointments found',
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

    // 4. Find matching appointments
    const { appointmentIds, explanation } = await findAppointmentsWithLLM({
      model,
      appointments,
      prompt,
      metadata,
      callbacks,
    })
    const htmlExplanation = await markdownToHtml(explanation)
    
    // Handle case where no appointments were found by LLM
    if (appointmentIds.length === 0) {
      await onComplete({
        data_points: {
          appointment: undefined,
          appointmentExists: 'false',
          explanation: htmlExplanation,
        },
        events: [
          addActivityEventLog({
            message: `Number of future scheduled or confirmed appointments: ${appointments.length}\n
            Appointments data: ${JSON.stringify(appointments, null, 2)}\n
            Found appointment: none\n
            Explanation: ${htmlExplanation}`,
          }),
        ],
      })
      return
    }

    // 5. If appointments were found by LLM, return the first matching appointment
    const matchedAppointmentId = appointmentIds[0]
    const foundAppointment = appointments.find(
      (appointment) => appointment.id === matchedAppointmentId
    )
   
    await onComplete({
      data_points: {
        appointment: !isNil(matchedAppointmentId)
          ? JSON.stringify(foundAppointment)
          : undefined,
        explanation: htmlExplanation,
        appointmentExists: !isNil(matchedAppointmentId) ? 'true' : 'false',
      },
      events: [
        addActivityEventLog({
          message: `Number of future scheduled or confirmed appointments: ${appointments.length}\n
          Appointments data: ${JSON.stringify(appointments, null, 2)}\n
          Found appointment: ${isNil(foundAppointment) ? 'none' : foundAppointment?.id}\n
          Explanation: ${htmlExplanation}`,
        }),
      ],
    })
  },
}
