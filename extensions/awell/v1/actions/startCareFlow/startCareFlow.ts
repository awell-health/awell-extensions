import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import {
  fields,
  PatientValidationSchema,
  FieldsValidationSchema,
  dataPoints,
} from './config'
import { z } from 'zod'
import { addActivityEventLog } from '../../../../../src/lib/awell/addEventLog'

export const startCareFlow: Action<typeof fields, typeof settings> = {
  key: 'startCareFlow',
  category: Category.WORKFLOW,
  title: 'Start care flow',
  description:
    'Start a new care flow for the patient currently enrolled in the care flow.',
  fields,
  dataPoints,
  previewable: false, // We don't have pathways in Preview, only cases.
  onEvent: async ({ payload, onComplete, helpers }): Promise<void> => {
    const {
      fields: { pathwayDefinitionId, baselineInfo },
      patient: { id: patientId },
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
        patient: PatientValidationSchema,
      }),
      payload,
    })

    const sdk = await helpers.awellSdk()
    const resp = await sdk.orchestration.mutation({
      startPathway: {
        __args: {
          input: {
            patient_id: patientId,
            pathway_definition_id: pathwayDefinitionId,
            data_points: baselineInfo,
          },
        },
        pathway_id: true,
      },
    })
    const careFlowId = resp.startPathway.pathway_id

    await onComplete({
      data_points: {
        careFlowId,
      },
      events: [
        addActivityEventLog({
          message: `Care flow started, instance ID: ${careFlowId}.`,
        }),
      ],
    })
  },
}
