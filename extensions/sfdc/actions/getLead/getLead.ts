import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validatePayloadAndCreateClient } from '../../lib'

export const getLead: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getLead',
  category: Category.CUSTOMER_SUPPORT,
  title: 'Get lead',
  description: 'Retrieve a Lead from Salesforce',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const { fields, salesforceClient } = await validatePayloadAndCreateClient({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const res = await salesforceClient.getRecord({
      sObject: 'Lead',
      sObjectId: fields.leadId,
    })

    await onComplete({
      data_points: {
        leadData: JSON.stringify(res),
      },
    })
  },
}
