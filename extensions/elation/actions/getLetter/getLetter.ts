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
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { letterId } = FieldsValidationSchema.parse(payload.fields)
    const api = makeAPIClient(payload.settings)

    const res = await api.getLetter(letterId)

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
