import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validatePayloadAndCreateClient } from '../../lib'

export const updateLead: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'updateLead',
  category: Category.CUSTOMER_SUPPORT,
  title: 'Update lead',
  description: 'Updates an existing lead object in Salesforce',
  fields,
  previewable: false,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, salesforceClient } = await validatePayloadAndCreateClient({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })
    await salesforceClient.updateRecord({
      sObject: 'Lead',
      sObjectId: fields.sObjectId,
      data: fields.data,
    })

    await onComplete()
  },
}
