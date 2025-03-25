import { isNil, defaultTo } from 'lodash'
import { type Action, Category } from '@awell-health/extensions-core'
import { isAfter, isBefore, parseISO } from 'date-fns'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'
import { type settings } from '../../settings'
import { makeAPIClient } from '../../client'
import { createOpenAIModel } from '../../../../src/lib/llm/openai/createOpenAIModel'
import { OPENAI_MODELS } from '../../../../src/lib/llm/openai/constants'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import { findAppointmentsWithLLM } from '../../lib/findAppointmentsWithLLM/findAppointmentsWithLLM'
import { markdownToHtml } from '../../../../src/utils'
import { extractDatesFromInstructions } from '../../lib/extractDatesFromInstructions/extractDatesFromInstructions'

export const cancelAppointments: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'cancelAppointments',
  category: Category.EHR_INTEGRATIONS,
  title: '✨ Cancel Appointments',
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
        modelType: OPENAI_MODELS.GPT4o,
      })

      // Extract date information from the prompt
      const { from, to, instructions } = await extractDatesFromInstructions({
        model,
        prompt,
        metadata,
        callbacks,
      })

      // Use LLM to find appointments matching the user's natural language prompt
      const { appointmentIds, explanation } = await findAppointmentsWithLLM({
        model,
        appointments,
        prompt: defaultTo(instructions, prompt),
        metadata,
        callbacks,
      })

      const htmlExplanation = await markdownToHtml(explanation)

      // Filter appointments based on both LLM selection and date range
      const appointmentsToCancel = appointments.filter(
        (appointment) =>
          appointmentIds.includes(appointment.id) &&
          (isNil(from) ||
            isAfter(parseISO(appointment.scheduled_date), parseISO(from))) &&
          (isNil(to) ||
            isBefore(parseISO(appointment.scheduled_date), parseISO(to)))
      )

      const appointmentIdsToCancel = appointmentsToCancel.map(
        (appointment) => appointment.id
      )

      // If no appointments match the criteria after filtering, return early
      if (appointmentIdsToCancel.length === 0) {
        await onComplete({
          data_points: {
            cancelledAppointments: JSON.stringify([]),
            explanation: isNil(htmlExplanation) ? 'No matching appointments found to cancel.' : htmlExplanation,
          }
        })
        return
      }

      // Cancel the filtered appointments
      const trace = await Promise.all(
        appointmentIdsToCancel.map(async (appointmentId) => {
          try {
            // Find the original appointment to get its service_location
            const appointmentToCancel = appointmentsToCancel.find(
              (appointment) => appointment.id === appointmentId
            )
            
            // Include service_location in the update if it exists in the original appointment
            const updateData: Record<string, any> = {
              status: { status: 'Cancelled' },
            }
            
            const serviceLocation = appointmentToCancel?.service_location;
            if (!isNil(serviceLocation)) {
              updateData.service_location = serviceLocation;
            }
            
            await api.updateAppointment(appointmentId, updateData)
            return { appointmentId, status: 'success' }
          } catch (error) {
            console.error(`Error canceling appointment ${appointmentId}:`, error)
            return { appointmentId, status: 'error' }
          }
        })
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
            message: `${appointmentsToCancel.length} appointments for patient ${patientId} were cancelled: ${appointmentIdsToCancel.join(', ')}`,
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
