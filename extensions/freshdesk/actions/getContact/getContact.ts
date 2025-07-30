import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib/validatePayloadAndCreateSdk'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { AxiosError } from 'axios'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'
import { isNil } from 'lodash'

export const getContact: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getContact',
  category: Category.CUSTOMER_SUPPORT,
  title: 'Get contact',
  description: 'Get a contact from Freshdesk.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const { fields, freshdeskSdk } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    try {
      const { data } = await freshdeskSdk.getContact(fields.contactId)
      console.log(JSON.stringify(data, null, 2))

      await onComplete({
        data_points: {
          contactData: JSON.stringify(data),
          name: data.name,
          email: isNil(data.email) ? undefined : data.email,
          customFields: isNil(data.custom_fields)
            ? undefined
            : JSON.stringify(data.custom_fields),
          tags: isNil(data.tags) ? undefined : JSON.stringify(data.tags),
        },
      })
    } catch (error) {
      // Some errors we want to handle explicitly for more human-readable logging
      if (error instanceof AxiosError) {
        const err = error as AxiosError

        if (err.response?.status === 404) {
          await onError({
            events: [
              addActivityEventLog({
                message: 'Contact not found (404)',
              }),
            ],
          })
          return
        }
        if (err.response?.status === 400) {
          await onError({
            events: [
              addActivityEventLog({
                message: `Bad request (400): ${JSON.stringify(err.response?.data, null, 2)}`,
              }),
            ],
          })
          return
        }

        // Throw other Axios errors
        throw error
      }

      // Throw all other errors
      throw error
    }
  },
}
