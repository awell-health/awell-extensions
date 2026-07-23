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
  previewable: false,
  supports_automated_retries: true,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log({ meta, fields: payload.fields }, 'Processing startCareFlow')

    try {
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
    } catch (err) {
      helpers.log({ meta, err }, 'error', err as Error)
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
