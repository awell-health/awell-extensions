import { type Action } from '@awell-health/extensions-core'
import { SettingsValidationSchema, type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import {
  fields,
  PathwayValidationSchema,
  FieldsValidationSchema,
} from './config'
import { z } from 'zod'
import AwellSdk from '../../sdk/awellSdk'

export const stopCareFlow: Action<typeof fields, typeof settings> = {
  key: 'stopCareFlow',
  category: Category.WORKFLOW,
  title: 'Stop care flow',
  description: 'Stop the care flow the patient is currently enrolled.',
  fields,
  previewable: false, // We don't have pathways in Preview, only cases.
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const {
        settings: { apiUrl, apiKey },
        fields: { reason },
        pathway: { id: pathwayId },
      } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
          settings: SettingsValidationSchema,
          pathway: PathwayValidationSchema,
        }),
        payload,
      })

      const sdk = new AwellSdk({ apiUrl, apiKey })

      await sdk.stopCareFlow({
        pathway_id: pathwayId,
        reason,
      })

      await onComplete()
    } catch (err) {
      /**
       * re-throw to be handled inside awell-extension-server
       */
      throw err
    }
  },
}
