import { ZodError } from 'zod'
import {
  type Action,
  type DataPointDefinition,
  type Field,
} from '../../../lib/types'
import { Category } from '../../../lib/types/marketplace'
import { type settings } from '../settings'
import { makeAPIClient } from '../client'
import { fromZodError } from 'zod-validation-error'
import { AxiosError } from 'axios'

const fields = {} satisfies Record<string, Field>

const dataPoints = {
  physicianId: {
    key: 'physicianId',
    valueType: 'number',
  },
  physicianFirstName: {
    key: 'physicianFirstName',
    valueType: 'string',
  },
  physicianLastName: {
    key: 'physicianLastName',
    valueType: 'string',
  },
  physicianCredentials: {
    key: 'physicianCredentials',
    valueType: 'string',
  },
  physicianEmail: {
    key: 'physicianEmail',
    valueType: 'string',
  },
  physicianNPI: {
    key: 'physicianNPI',
    valueType: 'string',
  },
  physicianUserId: {
    key: 'physicianUserId',
    valueType: 'number',
  },
  caregiverPracticeId: {
    key: 'caregiverPracticeId',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>

export const findPhysician: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'findPhysician',
  category: Category.EHR_INTEGRATIONS,
  title: 'Find Physician',
  description: "Retrieve a physician using Elation's patient API.",
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      // API Call should produce AuthError or something dif.
      const api = makeAPIClient(payload.settings)
      const physiciansList = await api.findPhysicians()

      if (physiciansList.count > 1) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: {
                en: `Find Physicians returned ${physiciansList.count} results, but the number of results must equal exactly 1.`,
              },
              error: {
                category: 'WRONG_DATA',
                message: `Find Physicians returned ${physiciansList.count} results, but the number of results must equal exactly 1.`,
              },
            },
          ],
        })
        return
      }

      const physician = physiciansList.results[0]
      await onComplete({
        data_points: {
          physicianId: String(physician.id),
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
