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
import { Settings, PatientId } from '../validation'
import { ElationAPIClient, makeDataWrapper } from '../client'
import { fromZodError } from 'zod-validation-error'
import { AxiosError } from 'axios'

const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The patient ID (a number)',
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

const Fields = z.object({
  patientId: PatientId,
})

const Schema = z.object({
  settings: Settings,
  fields: Fields,
})

export const getPatient: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'get_patient',
  category: Category.DEMO,
  title: 'Get Patient',
  description: "Get patient profile using elation's patient api.",
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      // Validation should produce ZodError
      const {
        fields: { patientId },
        settings,
      } = validate({ schema: Schema, payload })

      // API Call should produce AuthError or something dif.
      const api = new ElationAPIClient({
        auth: {
          ...settings,
          auth_url: 'https://sandbox.elationemr.com/api/2.0/oauth2/token',
        },
        baseUrl: 'https://sandbox.elationemr.com/api/2.0',
        makeDataWrapper,
      })
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
