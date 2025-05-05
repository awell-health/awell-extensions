import { Category, type Action } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdks } from '../../lib'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'

export const trackPersonEvent: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'trackPersonEvent',
  category: Category.CUSTOMER_SUPPORT,
  title: 'Track person event',
  description: 'Track a person event in Customer.io',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const { customerIoTrackClient, fields } =
      await validatePayloadAndCreateSdks({
        fieldsSchema: FieldsValidationSchema,
        payload,
      })

    await customerIoTrackClient.trackPersonEvent({
      type: 'person',
      action: 'event',
      name: fields.eventName,
      identifiers: {
        [fields.personIdentifierType]: fields.identifierValue,
      },
      attributes: fields.attributes,
    })

    await onComplete()
  },
}
