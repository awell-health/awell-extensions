import { isNil } from 'lodash'
import { type Action, Category } from '@awell-health/extensions-core'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'
import { type settings } from '../../settings'
import { makeAPIClient } from '../../client'
import { createOpenAIModel } from '../../../../src/lib/llm/openai/createOpenAIModel'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import { findAppointmentsWithLLM } from '../../lib/findAppointmentsWithLLM/findAppointmentsWithLLM'
import { markdownToHtml } from '../../../../src/utils'

export const cancelAppointments: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'cancelAppointments',
  category: Category.EHR_INTEGRATIONS,
  title: '✨ Cancel appointments',
  description: 'Cancel appointments for a patient using natural language.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const { prompt, patientId } = FieldsValidationSchema.parse(payload.fields)
    const api = makeAPIClient(payload.settings)

    /**
     * Fetch all upcoming appointments for the patient.
     * We're only interested in the upcoming appointments, so we set the from_date to the current date.
     */
    const appointments = await api.findAppointments({
      patient: patientId,
      from_date: new Date().toISOString(),
    })

    // Early return if no appointments found
    if (isNil(appointments) || appointments.length === 0) {
      const message = `No upcoming appointments found so none to cancel.`
      await onComplete({
        data_points: {
          explanation: message,
          cancelledAppointments: JSON.stringify([]),
        },
        events: [
          addActivityEventLog({
            message,
          }),
        ],
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

      const appointmentsToCancel = appointments.filter((appointment) =>
        appointmentIds.includes(appointment.id),
      )

      /**
       * Cancel the appointments
       */
      const trace = await Promise.all(
        appointmentIds.map(async (appointmentId) => {
          try {
            await api.updateAppointment(appointmentId, {
              status: { status: 'Cancelled' },
            })
            return { appointmentId, status: 'success' }
          } catch (error) {
            return { appointmentId, status: 'error' }
          }
        }),
      )

      const failedCancellations = trace.filter((t) => t.status === 'error')

      if (failedCancellations.length > 0) {
        await onError({
          events: [
            addActivityEventLog({
              message: `Successfully cancelled the following appointments: ${trace
                .filter((t) => t.status === 'success')
                .map((t) => t.appointmentId)
                .join(', ')}`,
            }),
            addActivityEventLog({
              message: `Failed to cancel the following appointments: ${failedCancellations
                .map((t) => t.appointmentId)
                .join(', ')}`,
            }),
          ],
        })
        return
      }

      await onComplete({
        data_points: {
          cancelledAppointments: JSON.stringify(appointmentsToCancel),
          explanation: htmlExplanation,
        },
        events: [
          addActivityEventLog({
            message: `${appointmentsToCancel.length} appointments for patient ${patientId} were cancelled: ${appointmentIds.join(', ')}`,
          }),
        ],
      })
    } catch (error) {
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: 'Failed to find and cancel appointments' },
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
