import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validatePayloadAndCreateClient } from '../../lib'
import { isSalesforceError, parseSalesforceError } from '../../lib/errors'
import { isNil } from 'lodash'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'

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
    const { fields, pathwayId, salesforceClient } =
      await validatePayloadAndCreateClient({
        fieldsSchema: FieldsValidationSchema,
        payload,
      })

    const data = {
      ...fields.data,
      ...(!isNil(fields.careFlowIdField) && {
        [fields.careFlowIdField]: pathwayId,
      }),
    }

    try {
      const res = await salesforceClient.createRecord({
        sObject: 'Lead',
        data,
      })

      await onComplete({
        data_points: {
          createdLeadId: String(res.id),
        },
        events: [
          addActivityEventLog({
            message: `Lead with ID ${String(
              res.id
            )} created in Saleforce. Data passed:\n\n ${JSON.stringify(
              data,
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
