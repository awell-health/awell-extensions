/* eslint-disable @typescript-eslint/naming-convention */
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
import { appointmentSchema } from '../validation/appointment.zod'
import { settingsSchema } from '../validation/settings.zod'

const fields = {
  scheduled_date: {
    id: 'scheduled_date',
    label: 'Scheduled date',
    description: 'Datetime (ISO8601).',
    type: FieldType.STRING,
    required: true
  },
  reason: {
    id: 'reason',
    label: 'Reason',
    description: 'Should not be free-text. The values are mapped to "appointment types" in the EMR. Maximum length of 50 characters.',
    type: FieldType.STRING,
    required: true
  },
  patient: {
    id: 'patient',
    label: 'Patient',
    description: 'Patient ID',
    type: FieldType.NUMERIC,
    required: true
  },
  physician: {
    id: 'physician',
    label: 'Physician',
    description: 'Physician ID',
    type: FieldType.NUMERIC,
    required: true
  },
  practice: {
    id: 'practice',
    label: 'Practice',
    description: 'Practice ID',
    type: FieldType.NUMERIC,
    required: true
  },
  duration: {
    id: 'duration',
    label: 'Duration',
    description: 'Number (in minutes). Must be a multiple of 5 and between 1 to 1440.',
    type: FieldType.NUMERIC,
  },
  description: {
    id: 'description',
    label: 'Description',
    description: 'Maximum length of 500 characters.',
    type: FieldType.STRING,
  },
  service_location: {
    id: 'service_location',
    label: 'Service location',
    description: 'Service location ID',
    type: FieldType.NUMERIC,
  },
  telehealth_details: {
    id: 'telehealth_details',
    label: 'Telehealth details',
    description: '',
    type: FieldType.STRING,
  },
} satisfies Record<string, Field>

const dataPoints = {
  appointmentId: {
    key: 'appointmentId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const createAppointment: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createAppointment',
  category: Category.INTEGRATIONS,
  title: 'Create Appointment',
  description: "Create Appointment using elation's scheduling api.",
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const { base_url, ...settings } = settingsSchema.parse(payload.settings);
      const appointment = appointmentSchema.parse(payload.fields)

      // API Call should produce AuthError or something dif.
      const api = new ElationAPIClient({
        auth: {
          ...settings,
        },
        baseUrl: base_url,
        makeDataWrapper,
      })
      const { id } = await api.createAppointment(appointment)
      await onComplete({
        data_points: {
          appointmentId: String(id)
        }
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
                message: `${err.status ?? '(no status code)'} Error: ${err.message
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
