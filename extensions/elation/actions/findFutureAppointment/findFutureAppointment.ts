import { isNil, defaultTo } from 'lodash'
import { type Action, Category } from '@awell-health/extensions-core'
import { isAfter, isBefore, parseISO } from 'date-fns'

import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'
import type { settings, SettingsType } from '../../settings'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import { getFutureAppointments } from './getFutureAppointments'
import { findAppointmentsWithLLM } from '../../lib/findAppointmentsWithLLM/findAppointmentsWithLLM'
import { createOpenAIModel } from '../../../../src/lib/llm/openai/createOpenAIModel'
import { OPENAI_MODELS } from '../../../../src/lib/llm/openai/constants'
import { markdownToHtml } from '../../../../src/utils'
import { extractDatesFromInstructions } from '../../lib/extractDatesFromInstructions/extractDatesFromInstructions'

export const findFutureAppointment: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'findFutureAppointment',
  category: Category.EHR_INTEGRATIONS,
  title: '✨ Find Future Appointment',
  description: 'Find a future appointment in Elation.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    // 1. Validate input
    const { prompt, patientId } = FieldsValidationSchema.parse(payload.fields)

    // 2. Get future appointments (scheduled or confirmed) first
    const appointments = await getFutureAppointments(
      payload.settings as SettingsType,
      patientId,
    )

    // Early return if no appointments found - no need to go to LLMs
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

    // 4. Extract date information from the prompt
    const { from, to, instructions } = await extractDatesFromInstructions({
      model,
      prompt,
      metadata,
      callbacks,
    })

    // 5. Find matching appointments with LLM
    const { appointmentIds, explanation } = await findAppointmentsWithLLM({
      model,
      appointments,
      prompt: defaultTo(instructions, prompt),
      metadata,
      callbacks,
      evaluateDates: true,
    })
    const htmlExplanation = await markdownToHtml(explanation)

    // 6. Filter appointments based on both LLM selection and date range
    const filteredAppointments = appointments.filter(
      (appointment) =>
        appointmentIds.includes(appointment.id) &&
        (isNil(from) ||
          isAfter(parseISO(appointment.scheduled_date), parseISO(from))) &&
        (isNil(to) ||
          isBefore(parseISO(appointment.scheduled_date), parseISO(to))),
    )

    const filteredAppointmentIds = filteredAppointments.map(
      (appointment) => appointment.id
    )

    // Handle case where no appointments were found after filtering
    if (filteredAppointmentIds.length === 0) {
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

    // 7. If appointments were found, return the first matching appointment
    const matchedAppointmentId = filteredAppointmentIds[0]
    const foundAppointment = filteredAppointments[0]

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
