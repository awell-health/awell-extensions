import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validatePayloadAndCreateClient } from '../../lib'
import { AxiosError, isAxiosError } from 'axios'
import { parseAxiosError, parseUnknowError } from '../../lib/errors'

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

    try {
      const res = await salesforceClient.createRecord({
        sObject: 'Lead',
        data: fields.data,
      })

      await onComplete({
        data_points: {
          createdLeadId: String(res.id),
        },
      })
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
