import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validatePayloadAndCreateClient } from '../../lib'
import { isSalesforceError, parseSalesforceError } from '../../lib/errors'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'

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
    try {
      await salesforceClient.updateRecord({
        sObject: 'Lead',
        sObjectId: fields.sObjectId,
        data: fields.data,
      })

      await onComplete({
        events: [
          addActivityEventLog({
            message: `Lead updated. Data passed:\n\n ${JSON.stringify(
              fields.data,
              null,
              2
            )}`,
          }),
        ],
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
