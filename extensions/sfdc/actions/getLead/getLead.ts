import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validatePayloadAndCreateClient } from '../../lib'
import { isSalesforceError, parseSalesforceError } from '../../lib/errors'

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

    try {
      const res = await salesforceClient.getRecord({
        sObject: 'Lead',
        sObjectId: fields.leadId,
      })

      await onComplete({
        data_points: {
          leadData: JSON.stringify(res),
        },
      })
    } catch (error) {
      if (isSalesforceError(error)) {
        await onError({
          events: [parseSalesforceError(error)],
        })
      } else {
        // we handle ZodError and unknown errors in extension-server directly
        throw error
      }
    }
  },
}
