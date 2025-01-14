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
    const res = await api.getAllUsers()
    const user = res.results.find((user) => user.email === userEmail)

    if (isNil(user)) {
      await onError({
        events: [
          addActivityEventLog({
            message: 'No user found with the provided email',
          }),
        ],
      })
      return
    }

    await onComplete({
      data_points: {
        userId: String(user.id),
      },
    })
  },
}
