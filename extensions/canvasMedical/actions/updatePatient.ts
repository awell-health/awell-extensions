/* eslint-disable @typescript-eslint/naming-convention */
import { ZodError } from 'zod'
import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Field,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../settings'
import { makeAPIClient } from '../client'
import { fromZodError } from 'zod-validation-error'
import { AxiosError } from 'axios'
import { patientWithIdSchema } from '../validation/dto/patient.zod'

const fields = {
  patient_data: {
    id: 'patient_data',
    label: 'Patient data',
    description: 'Patient data',
    type: FieldType.JSON,
    required: true,
  },
} satisfies Record<string, Field>

const dataPoints = {} satisfies Record<string, DataPointDefinition>

export const updatePatient: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'updatePatient',
  category: Category.EHR_INTEGRATIONS,
  title: 'Update Patient',
  description: 'Update a patient',
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const patient = patientWithIdSchema.parse(payload.fields.patient_data)

      // API Call should produce AuthError or something dif.
      const api = makeAPIClient(payload.settings)
      await api.updatePatient(patient)
      await onComplete()
    } catch (err) {
      if (err instanceof ZodError) {
        const error = fromZodError(err)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: error.message },
              error: {
                category: 'SERVER_ERROR',
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
