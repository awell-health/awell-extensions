import { ZodError } from 'zod'
import {
  FieldType,
  NumericIdSchema,
  type Action,
  type DataPointDefinition,
  type Field,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../settings'
import { makeAPIClient } from '../client'
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
  firstName: {
    key: 'firstName',
    valueType: 'string',
  },
  lastName: {
    key: 'lastName',
    valueType: 'string',
  },
  dateOfBirth: {
    key: 'dateOfBirth',
    valueType: 'date',
  },
  gender: {
    key: 'gender',
    valueType: 'string',
  },
  doctorId: {
    key: 'doctorId',
    valueType: 'number',
  },
  chartId: {
    key: 'chartId',
    valueType: 'string',
  },
  email: {
    key: 'email',
    valueType: 'string',
  },
  ethnicity: {
    key: 'ethnicity',
    valueType: 'string',
  },
  race: {
    key: 'race',
    valueType: 'string',
  },
  preferredLanguage: {
    key: 'preferredLanguage',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const getPatient: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getPatient',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get Patient',
  description: 'Retrieve a patient profile using DrChrono API.',
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const patientId = NumericIdSchema.parse(payload.fields.patientId)

      // API Call should produce AuthError or something dif.
      const api = makeAPIClient(payload.settings)
      const patientInfo = await api.getPatient(patientId)
      await onComplete({
        data_points: {
          firstName: patientInfo.first_name,
          lastName: patientInfo.last_name,
          dateOfBirth: patientInfo.date_of_birth,
          gender: patientInfo.gender,
          ethnicity: patientInfo.ethnicity,
          race: patientInfo.race,
          preferredLanguage: patientInfo.preferred_language,
          chartId: patientInfo.chart_id,
          doctorId: String(patientInfo.doctor),
          email: patientInfo.email,
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
                category: 'WRONG_INPUT',
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
                category: 'SERVER_ERROR',
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
