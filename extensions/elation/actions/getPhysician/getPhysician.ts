import { ZodError } from 'zod'
import { type Action, Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { makeAPIClient } from '../../client'
import { fromZodError } from 'zod-validation-error'
import { AxiosError } from 'axios'
import { FieldsValidationSchema, fields, dataPoints } from './config'

export const getPhysician: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getPhysician',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get Physician',
  description: "Retrieve a physician using Elation's patient API.",
  fields,
  previewable: true,
  supports_automated_retries: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const validatedFields = FieldsValidationSchema.parse(payload.fields)

      const api = makeAPIClient(payload.settings)
      const physician = await api.getPhysician(validatedFields.physicianId)

      await onComplete({
        data_points: {
          physicianFirstName: physician.first_name,
          physicianLastName: physician.last_name,
          physicianCredentials: physician.credentials,
          physicianEmail: physician.email,
          physicianNPI: physician.npi,
          physicianUserId: String(physician.user_id),
          caregiverPracticeId: String(physician.practice),
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
