import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { z } from 'zod'
import { addActivityEventLog } from '../../../../../src/lib/awell/addEventLog'
import { getStakeholderId } from '../../../../../src/lib/awell/getStakeholderId'

export const getHostedPagesLink: Action<typeof fields, typeof settings> = {
  key: 'getHostedPagesLink',
  category: Category.WORKFLOW,
  title: 'Get Hosted Pages Link',
  description:
    'Fetch the static Hosted Pages link for a stakeholder (defaults to the patient)',
  fields,
  dataPoints,
  previewable: false,
  supports_automated_retries: true,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    helpers.log({ fields: payload.fields }, 'Processing getHostedPagesLink')

    try {
      const {
        fields: { careFlowId, stakeholder },
      } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const sdk = await helpers.awellSdk()

      const pathwayRes = await sdk.orchestration.query({
        pathway: {
          __args: {
            id: careFlowId,
          },
          pathway: {
            release_id: true,
            patient_id: true,
          },
        },
      })

      const releaseId = pathwayRes?.pathway.pathway?.release_id
      const patientId = pathwayRes?.pathway.pathway?.patient_id

      if (releaseId === undefined)
        throw new Error('Could not retrieve the release ID for this care flow.')

      const stakeholderId = await getStakeholderId({
        awellSdk: sdk,
        pathwayId: careFlowId,
        releaseId,
        patientId,
        stakeholder,
      })

      const res = await sdk.orchestration.query({
        hostedPagesLink: {
          __args: {
            pathway_id: careFlowId,
            stakeholder_id: stakeholderId,
          },
          success: true,
          hosted_pages_link: {
            id: true,
            url: true,
          },
        },
      })

      const linkUrl = res.hostedPagesLink.hosted_pages_link?.url

      if (linkUrl === undefined || linkUrl === null)
        throw new Error(
          `Could not find a Hosted Pages link for stakeholder ${stakeholder} in care flow ${careFlowId}. There may be no activity for this stakeholder in this care flow.`,
        )

      await onComplete({
        data_points: {
          linkUrl,
        },
        events: [
          addActivityEventLog({
            message: `Fetched the Hosted Pages link for care flow instance id ${careFlowId} and stakeholder ${stakeholder} (${stakeholderId}). Link URL is ${linkUrl}.`,
          }),
        ],
      })
    } catch (err) {
      helpers.log({ err }, 'error', err as Error)
      const error = err as Error
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
    }
  },
}
