import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validatePayloadAndCreateClient } from '../../lib'
import {
  isSalesforceRestAPIClient,
  isSalesforceTemporaryClient,
} from '../../lib/utilts'

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

    /**
     * The temporary client should be deleted once
     * we use this extension in a production setting
     */
    const getResponse = async () => {
      if (isSalesforceRestAPIClient(salesforceClient)) {
        return await salesforceClient.createRecord({
          sObject: fields.sObject,
          data: fields.data,
        })
      } else if (isSalesforceTemporaryClient(salesforceClient)) {
        const res = await salesforceClient.api.createRecord({
          sObject: fields.sObject,
          data: fields.data,
        })

        return res.data
      }

      throw new Error('This should not happen')
    }

    const res = await getResponse()

    await onComplete({
      data_points: {
        createdRecordId: String(res.id),
      },
    })
  },
}
