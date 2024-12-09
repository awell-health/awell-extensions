import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { z } from 'zod'
import { addActivityEventLog } from '../../../../../src/lib/awell/addEventLog'

export const startCareFlowAndSession: Action<typeof fields, typeof settings> = {
  key: 'startCareFlowAndSession',
  category: Category.WORKFLOW,
  title: 'Start Care flow and session',
  description: 'Start a new care flow and immediately create a session',
  fields,
  dataPoints,
  previewable: false,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const {
      fields: { careFlowDefinitionId, stakeholderDefinitionId, baselineInfo },
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
      }),
      payload,
    })

    const sdk = await helpers.awellSdk()

    const resp = await sdk.orchestration.mutation({
      startHostedPathwaySession: {
        __args: {
          input: {
            patient_id: payload.patient.id,
            pathway_definition_id: careFlowDefinitionId,
            // If the stakeholder is the patient, we don't need to specify a stakeholder definition id
            stakeholder_definition_id:
              stakeholderDefinitionId === 'patient'
                ? undefined
                : stakeholderDefinitionId,
            data_points: baselineInfo,
          },
        },
        success: true,
        pathway_id: true,
        session_url: true,
      },
    })

    const {
      startHostedPathwaySession: { pathway_id, session_url },
    } = resp

    await onComplete({
      data_points: {
        careFlowId: pathway_id,
        sessionUrl: session_url,
      },
      events: [
        addActivityEventLog({
          message: `Care flow started with instance id ${pathway_id}. Session URL is ${session_url}.`,
        }),
      ],
    })
  },
}
