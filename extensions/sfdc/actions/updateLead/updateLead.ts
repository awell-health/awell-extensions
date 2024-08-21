import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validatePayloadAndCreateClient } from '../../lib'
import { AxiosError, isAxiosError } from 'axios'
import { parseAxiosError, parseUnknowError } from '../../lib/errors'

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

      await onComplete()
    } catch (error) {
      let parsedError

      if (isAxiosError(error)) {
        parsedError = parseAxiosError(error as AxiosError)
      } else {
        parsedError = parseUnknowError(error as Error)
      }
      await onError({
        events: [parsedError],
      })
    }
  },
}
