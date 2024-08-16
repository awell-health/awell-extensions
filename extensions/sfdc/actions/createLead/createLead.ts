import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validatePayloadAndCreateClient } from '../../lib'

export const createLead: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createLead',
  category: Category.CUSTOMER_SUPPORT,
  title: 'Create lead',
  description: 'Creates a new lead object in Salesforce',
  fields,
  previewable: false,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, salesforceClient } = await validatePayloadAndCreateClient({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const res = await salesforceClient.createRecord({
      sObject: 'Lead',
      data: fields.data,
    })

    await onComplete({
      data_points: {
        createdLeadId: String(res.id),
      },
    })
  },
}
