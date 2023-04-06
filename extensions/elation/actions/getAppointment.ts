import { ZodError } from 'zod'
import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Field,
} from '../../../lib/types'
import { Category } from '../../../lib/types/marketplace'
import { type settings } from '../settings'
import { ElationAPIClient, makeDataWrapper } from '../client'
import { fromZodError } from 'zod-validation-error'
import { AxiosError } from 'axios'
import { settingsSchema } from '../validation/settings.zod'
import { numberId } from '../validation/generic.zod'

const fields = {
  appointmentId: {
    id: 'appointmentId',
    label: 'Appointment ID',
    description: 'The appointment ID (a number)',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

const dataPoints = {
  scheduledDate: {
    key: 'scheduledDate',
    valueType: 'string',
  },
  reason: {
    key: 'reason',
    valueType: 'string',
  },
  patientId: {
    key: 'patientId',
    valueType: 'string',
  },
  physicianId: {
    key: 'physicianId',
    valueType: 'string',
  },
  practiceId: {
    key: 'practiceId',
    valueType: 'string',
  },
  duration: {
    key: 'duration',
    valueType: 'string',
  },
  description: {
    key: 'description',
    valueType: 'string',
  },
  serviceLocationId: {
    key: 'serviceLocationId',
    valueType: 'string',
  },
  telehealthDetails: {
    key: 'telehealthDetails',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const getAppointment: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getAppointment',
  category: Category.INTEGRATIONS,
  title: 'Get Appointment',
  description: "Get appointment using elation's scheduling api.",
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const { base_url, ...settings } = settingsSchema.parse(payload.settings)
      const appointmentId = numberId.parse(payload.fields.appointmentId)

      // API Call should produce AuthError or something dif.
      const api = new ElationAPIClient({
        auth: settings,
        baseUrl: base_url,
        makeDataWrapper,
      })
      const appointmentInfo = await api.getAppointment(appointmentId)
      await onComplete({
        data_points: {
          scheduledDate: appointmentInfo.scheduled_date,
          reason: appointmentInfo.reason,
          patientId: String(appointmentInfo.patient),
          physicianId: String(appointmentInfo.physician),
          practiceId: String(appointmentInfo.practice),
          duration: String(appointmentInfo.duration),
          description: appointmentInfo.description,
          serviceLocationId: String(appointmentInfo.service_location?.id),
          telehealthDetails: appointmentInfo.telehealth_details,
        },
      })
    } catch (err) {
      if (err instanceof ZodError) {
        const error = fromZodError(err)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: error.message },
              error: {
                category: 'BAD_REQUEST',
                message: error.message,
              },
            },
          ],
        })
      } else if (err instanceof AxiosError) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: {
                en: `${err.status ?? '(no status code)'} Error: ${err.message}`,
              },
              error: {
                category: 'BAD_REQUEST',
                message: `${err.status ?? '(no status code)'} Error: ${
                  err.message
                }`,
              },
            },
          ],
        })
      } else {
        const message = (err as Error).message
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: message },
              error: {
                category: 'SERVER_ERROR',
                message,
              },
            },
          ],
        })
      }
    }
  },
}
