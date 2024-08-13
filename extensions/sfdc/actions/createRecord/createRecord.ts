import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validatePayloadAndCreateClient } from '../../lib'

export const createRecord: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createRecord',
  category: Category.CUSTOMER_SUPPORT,
  title: 'Create record',
  description: 'Creates a new record',
  fields,
  previewable: false,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, salesforceClient } = await validatePayloadAndCreateClient({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const res = await salesforceClient.createRecord({
      sObject: fields.sObject,
      data: fields.data,
    })

    await onComplete({
      data_points: {
        createdRecordId: String(res.id),
      },
    })
  },
}
