import { type Action, Category } from '@awell-health/extensions-core'
import { isAfter, isBefore, isEqual, parseISO } from 'date-fns'
import { defaultTo, isNil } from 'lodash'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'
import { OPENAI_MODELS } from '../../../../src/lib/llm/openai/constants'
import { createOpenAIModel } from '../../../../src/lib/llm/openai/createOpenAIModel'
import { markdownToHtml } from '../../../../src/utils'
import { makeAPIClient } from '../../client'
import { extractDatesFromInstructions } from '../../lib/extractDatesFromInstructions/extractDatesFromInstructions'
import { findAppointmentsWithLLM } from '../../lib/findAppointmentsWithLLM/findAppointmentsWithLLM'
import { type settings } from '../../settings'
import { FieldsValidationSchema, dataPoints, fields } from './config'
import { getAppointmentCountsByStatus } from './getAppointmentCountByStatus'
import { type AppointmentResponse } from '../../types'

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
  supports_automated_retries: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const { prompt, patientId } = FieldsValidationSchema.parse(payload.fields)
    const api = makeAPIClient(payload.settings)

    try {
      // Initialize OpenAI model for natural language processing
      const { model, metadata, callbacks } = await createOpenAIModel({
        modelType: OPENAI_MODELS.GPT4o,
        settings: {},
        helpers,
        payload,
      })

      const { from, to, instructions } = await extractDatesFromInstructions({
        model,
        prompt,
        metadata,
        callbacks,
      })

      // First fetch all appointments for the patient
      const appointments = await api.findAppointments({
        patient: patientId,
      })

      // Early return if no appointments found
      if (isNil(appointments) || appointments.length === 0) {
        await onComplete({
          data_points: {
            explanation: 'No appointments found for the given patient',
            appointmentsFound: 'false',
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
        prompt: defaultTo(instructions, 'Find all appointments'),
        metadata,
        callbacks,
      })

      const htmlExplanation = await markdownToHtml(explanation)

      // Filter appointments based on LLM's selection.
      // Use inclusive comparison for dates to ensure we don't filter out appointments that are exactly the same as the from or to date.
      const filter = (appointment: AppointmentResponse): boolean =>
        appointmentIds.includes(appointment.id) &&
        (isNil(from) ||
          isAfter(parseISO(appointment.scheduled_date), parseISO(from)) ||
          isEqual(parseISO(appointment.scheduled_date), parseISO(from))) &&
        (isNil(to) ||
          isBefore(parseISO(appointment.scheduled_date), parseISO(to)) ||
          isEqual(parseISO(appointment.scheduled_date), parseISO(to)))

      const selectedAppointments = appointments.filter((appointment) =>
        filter(appointment),
      )
      const appointmentsFilteredOut = appointments
        .filter((appointment) => !filter(appointment))
        .map((appointment) => ({
          id: appointment.id,
          date: appointment.scheduled_date,
        }))

      const appointmentCountsByStatus =
        getAppointmentCountsByStatus(selectedAppointments)

      const events = [
        addActivityEventLog({
          message: `Found ${appointmentIds.length} appointments for patient ${patientId} that match the search instructions.`,
        }),
      ]
      if (!isNil(from) && !isNil(to)) {
        events.push(
          addActivityEventLog({
            message: `Narrowed down to ${selectedAppointments.length} appointments scheduled between ${from} and ${to}. Excluded ${appointmentsFilteredOut.length} appointments: ${JSON.stringify(appointmentsFilteredOut)}`,
          }),
        )
      } else if (!isNil(from)) {
        events.push(
          addActivityEventLog({
            message: `Narrowed down to ${selectedAppointments.length} appointments scheduled after ${from}.`,
          }),
        )
      } else if (!isNil(to)) {
        events.push(
          addActivityEventLog({
            message: `Narrowed down to ${selectedAppointments.length} appointments scheduled before ${to}.`,
          }),
        )
      }
      await onComplete({
        data_points: {
          appointments: JSON.stringify(selectedAppointments),
          explanation: htmlExplanation,
          appointmentsFound: selectedAppointments.length > 0 ? 'true' : 'false',
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
