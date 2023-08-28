import { z, ZodError } from 'zod'
import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Fields,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../settings'
import { makeAPIClient } from '../client'
import type schemas from '../schemas'
import { fromZodError } from 'zod-validation-error'
import { AxiosError } from 'axios'

const fields = {
  patientId: {
    id: 'patientId',
    label: 'Patient ID',
    description: 'The patient ID',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Fields<typeof schemas>

const dataPoints = {
  patient_data: {
    key: 'patient_data',
    valueType: 'json',
    jsonType: 'canvas_patient',
  },
} satisfies Record<string, DataPointDefinition<typeof schemas>>

export const getPatient: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints,
  typeof schemas
> = {
  key: 'getPatient',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get Patient',
  description: "Retrieve a patient profile using Canvas's patient API.",
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const patientId = z.string().parse(payload.fields.patientId)

      // API Call should produce AuthError or something dif.
      const api = makeAPIClient(payload.settings)
      const patient = await api.getPatient(patientId)
      await onComplete({
        data_points: {
          patient_data: JSON.stringify(patient),
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
