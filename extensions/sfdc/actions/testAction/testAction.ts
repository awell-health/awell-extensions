import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validatePayloadAndCreateClient } from '../../lib'

export const testAction: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'testAction',
  category: Category.CUSTOMER_SUPPORT,
  title: 'Test action',
  description: 'Test connection with SFDC',
  fields,
  previewable: false,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, salesforceClient } = await validatePayloadAndCreateClient({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const res = await salesforceClient.getRecordShape(fields.sObject)

    await onComplete({
      data_points: {
        res: JSON.stringify(res),
      },
    })
  },
}
