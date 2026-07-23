import { type Action, Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { makeAPIClient } from '../../client'
import { FieldsValidationSchema, fields, dataPoints } from './config'

export const getLetter: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getLetter',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get letter',
  description: 'Retrieve a letter from Elation.',
  fields,
  previewable: true,
  supports_automated_retries: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    const { letterId } = FieldsValidationSchema.parse(payload.fields)
    const api = makeAPIClient(payload.settings)

    helpers.log({ meta, letterId }, 'Getting Elation letter')
    const res = await api.getLetter(letterId)

    helpers.log({ meta, letterId }, 'Got Elation letter')

    await onComplete({
      data_points: {
        body: res.body,
        signedBy:
          typeof res?.signed_by === 'number'
            ? String(res.signed_by)
            : undefined,
      },
    })
  },
}
