import { z, ZodError } from 'zod'
import { validate } from '../../../lib/shared/validation'
import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Field,
} from '../../../lib/types'
import { Category } from '../../../lib/types/marketplace'
import { type settings } from '../settings'
import { Settings } from '../validation'
import { ElationAPIClient, makeDataWrapper } from '../client'
import { fromZodError } from 'zod-validation-error'

const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'A string field configured at design time',
    type: FieldType.NUMERIC,
    required: true,
  },
} satisfies Record<string, Field>

const dataPoints = {
  first_name: {
    key: 'first_name',
    valueType: 'string',
  },
  last_name: {
    key: 'last_name',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

const PatientId = z.object({ patientId: z.number({ coerce: true }) })

const Schema = z.object({
  settings: Settings,
  fields: PatientId,
})

export const getPatient: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'log',
  category: Category.DEMO,
  title: 'Log hello world',
  description: 'This is a dummy Custom Action for extension developers.',
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const {
      fields: { patientId },
      settings,
    } = validate({ schema: Schema, payload })
    // right now the base url is hardcoded
    const baseUrl = 'https://sandbox.elationemr.com/api/2.0'
    const api = new ElationAPIClient(
      {
        ...settings,
        auth_url: 'https://sandbox.elationemr.com/api/2.0/oauth2/token/',
      },
      baseUrl,
      makeDataWrapper
    )
    try {
      const patientInfo = await api.getPatient(patientId)
      await onComplete({
        data_points: {
          first_name: patientInfo.first_name,
          last_name: patientInfo.last_name,
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
