import { type Action, Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { makeAPIClient } from '../../client'
import { FieldsValidationSchema, fields, dataPoints } from './config'
import { type AxiosError } from 'axios'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'

export const updateReferralOrderResolution: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'updateReferralOrderResolution',
  category: Category.EHR_INTEGRATIONS,
  title: 'Update referral order resolution',
  description: 'Update the resolution of a referral order in Elation.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const { referralOrderId, resolutionState } = FieldsValidationSchema.parse(
      payload.fields,
    )
    const api = makeAPIClient(payload.settings)

    try {
      await api.updateReferralOrder(referralOrderId, {
        resolution: {
          state: resolutionState,
        },
      })
    } catch (error) {
      const err = error as AxiosError

      if (err.status === 404) {
        await onError({
          events: [
            addActivityEventLog({
              message: `The referral order (${referralOrderId}) does not exist.`,
            }),
          ],
        })
        return
      }

      // All other errors we didn't handle explicitly we will throw
      throw error
    }

    await onComplete()
  },
}
