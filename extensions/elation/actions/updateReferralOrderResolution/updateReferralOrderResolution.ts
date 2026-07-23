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
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    const { referralOrderId, resolutionState, resolvingDocument } =
      FieldsValidationSchema.parse(payload.fields)
    const api = makeAPIClient(payload.settings)
    const updateReferralOrderInput = {
      resolution: {
        state: resolutionState,
        resolving_document: resolvingDocument,
      },
    }

    try {
      helpers.log(
        { meta, updateReferralOrderInput },
        '[updateReferralOrderResolution] Updating Elation referral order',
      )

      await api.updateReferralOrder(referralOrderId, updateReferralOrderInput)
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
