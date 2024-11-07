import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { z } from 'zod'
import { addActivityEventLog } from '../../../../../src/lib/awell/addEventLog'

const delay = async (ms: number): Promise<void> => {
  await new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export const startHostedPagesSession: Action<typeof fields, typeof settings> = {
  key: 'startHostedPagesSession',
  category: Category.WORKFLOW,
  title: 'Start Hosted Pages Session',
  description: 'Start a new Hosted Pages session for a given stakeholder',
  fields,
  dataPoints,
  previewable: false,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const {
      fields: { careFlowId, stakeholder },
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
      }),
      payload,
    })

    // To make sure the care flow activated the activity for the stakeholder :-)
    await delay(4000)

    const normalizedStakeholder = stakeholder.toLowerCase()

    const sdk = await helpers.awellSdk()

    const pathwayRes = await sdk.orchestration.query({
      pathway: {
        __args: {
          id: careFlowId,
        },
        pathway: {
          release_id: true,
        },
      },
    })

    const releaseId = pathwayRes?.pathway.pathway?.release_id

    if (releaseId === undefined)
      throw new Error('Could not retrieve the release ID for this care flow.')

    const getStakeholderId = async (releaseId: string): Promise<string> => {
      const stakeholdersInRelease = await sdk.orchestration.query({
        stakeholdersByReleaseIds: {
          __args: {
            release_ids: [releaseId],
          },
          success: true,
          stakeholders: {
            id: true,
            label: {
              en: true,
            },
            definition_id: true,
          },
        },
      })

      console.log(stakeholdersInRelease)

      const stakeholderMatchId =
        stakeholdersInRelease.stakeholdersByReleaseIds.stakeholders.find(
          (stakeholder) =>
            stakeholder.label.en.toLowerCase() === normalizedStakeholder
        )?.id

      if (stakeholderMatchId === undefined)
        throw new Error(
          `Could not find stakeholder ID for ${normalizedStakeholder} in care flow ${careFlowId}`
        )

      return stakeholderMatchId
    }

    const stakeholderId = await getStakeholderId(releaseId)

    const res = await sdk.orchestration.mutation({
      startHostedActivitySession: {
        __args: {
          input: {
            pathway_id: careFlowId,
            stakeholder_id: stakeholderId,
          },
        },
        success: true,
        session_url: true,
      },
    })

    await onComplete({
      data_points: {
        sessionUrl: res.startHostedActivitySession.session_url,
      },
      events: [
        addActivityEventLog({
          message: `Session started for care flow instance id ${careFlowId} and stakeholder ${stakeholder} (${stakeholderId}). Session URL is ${res.startHostedActivitySession.session_url}.`,
        }),
      ],
    })
  },
}
