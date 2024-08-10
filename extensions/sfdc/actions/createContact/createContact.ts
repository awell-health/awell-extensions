import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validatePayloadAndCreateClient } from '../../lib'
import { isEmpty } from 'lodash'

export const createContact: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createContact',
  category: Category.CUSTOMER_SUPPORT,
  title: 'Create contact',
  description:
    'Creates a new contact with the specified information in the specified attribute groups.',
  fields,
  previewable: false,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, salesforceClient } = await validatePayloadAndCreateClient({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const res = await salesforceClient.createContact(fields)

    await onComplete({
      data_points: {
        contactId: String(res.contactId),
      },
    })
  },
}
