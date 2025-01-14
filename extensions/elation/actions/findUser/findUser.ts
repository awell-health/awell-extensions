import { type Action, Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { makeAPIClient } from '../../client'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'
import { isNil } from 'lodash'

export const findUser: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'findUser',
  category: Category.EHR_INTEGRATIONS,
  title: 'Find user',
  description: 'Find a user by email in Elation.',
  fields,
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const { userEmail } = FieldsValidationSchema.parse(payload.fields)
    const api = makeAPIClient(payload.settings)

    /**
     * Elation doesn't have server-side support for searching users by email.
     * We need to get all users and then search by email in the action.
     */
    const limit = 100 // Number of results per page
    let offset = 0 // Start at the first page
    let user = null // Initialize user as null

    try {
      while (true) {
        const res = await api.getAllUsers({ limit, offset })

        // Search for the user in the current page
        user = res.results.find((user) => user.email === userEmail)

        if (!isNil(user)) {
          // User found, exit the loop
          break
        }

        // If no more results, exit the loop
        if (res.next === null) {
          break
        }

        // Increment the offset for the next page
        offset += limit
      }

      if (isNil(user)) {
        // User not found after checking all pages
        await onError({
          events: [
            addActivityEventLog({
              message: 'No user found with the provided email',
            }),
          ],
        })
        return
      }

      // User found, return the user ID
      await onComplete({
        data_points: {
          userId: String(user.id),
        },
      })
    } catch (error) {
      const err = error as Error
      await onError({
        events: [
          addActivityEventLog({
            message: `Error occurred while searching for user: ${err.message}`,
          }),
        ],
      })
    }
  },
}
