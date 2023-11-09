import { z, ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema } from '../../../settings'
import { FieldsValidationSchema, fields } from './config'
import {
  SendbirdClient,
  isSendbirdDeskError,
  sendbirdDeskErrorToActivityEvent,
} from '../../client'
import { isEqual, isNil } from 'lodash'

/**
 * @link https://sendbird.com/docs/desk/platform-api/v1/features/customer#2-update-custom-fields-of-a-customer
 */
export const updateCustomerCustomFields: Action<
  typeof fields,
  typeof settings
> = {
  key: 'updateCustomerCustomFields',
  title: "Update customer's custom fields",
  description: 'Updates custom fields of a customer using the Desk API.',
  category: Category.COMMUNICATION,
  fields,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        settings: { applicationId, chatApiToken, deskApiToken },
        fields: { customerId, customFields },
      } = validate({
        schema: z.object({
          settings: SettingsValidationSchema,
          fields: FieldsValidationSchema,
        }),
        payload,
      })

      const client = new SendbirdClient({
        applicationId,
        chatApiToken,
        deskApiToken,
      })

      const {
        data: { customFields: receivedCustomFields },
      } = await client.deskApi.updateCustomerCustomFields(customerId, {
        customFields,
      })

      // check that all fields were updated
      try {
        const customFieldsObject = JSON.parse(customFields)
        const providedFields = Object.keys(customFieldsObject)
        const receivedFields = receivedCustomFields.map(({ key }) => key)
        const missingFields = receivedFields.filter(
          (field) => !providedFields.includes(field)
        )
        if (missingFields.length > 0) {
          await onError({
            events: [
              {
                date: new Date().toISOString(),
                text: {
                  en: `Some custom fields do not appear to have been set correctly`,
                },
                error: {
                  category: 'WRONG_DATA',
                  message: `The following fields were not updated: ${missingFields.join(
                    ', '
                  )}`,
                },
              },
            ],
          })
          return
        }
      } catch (e) {
        // if we can't parse the JSON, we can't check if all fields were updated
        // so we just skip this check
      }

      // check that values match
      try {
        const customFieldsObject = JSON.parse(customFields)
        const fieldsWithMismatchedValues = Object.keys(customFieldsObject)
          .filter((key) => {
            const valueToSet =
              customFieldsObject[key as keyof typeof customFields]
            const valueReceived = receivedCustomFields.find(
              ({ key: receivedKey }) => key === receivedKey
            )?.value

            try {
              // check if value is a valid JSON
              const parsedValueToSet = JSON.parse((valueToSet as string) ?? '')
              const parsedValueReceived = JSON.parse(valueReceived ?? '')
              return !isEqual(parsedValueToSet, parsedValueReceived)
            } catch (e) {
              // if not, compare as strings
              return valueToSet !== valueReceived
            }
          })
          .filter((value) => !isNil(value))

        if (fieldsWithMismatchedValues.length > 0) {
          await onError({
            events: [
              {
                date: new Date().toISOString(),
                text: {
                  en: `Some fields do not appear to have been correctly updated`,
                },
                error: {
                  category: 'WRONG_DATA',
                  message: `The following fields were not updated: ${fieldsWithMismatchedValues.join(
                    ', '
                  )}`,
                },
              },
            ],
          })
          return
        }
      } catch (e) {
        // if we can't parse the JSON, we can't check if all fields were updated
        // so we just skip this check
      }

      // if all checks passed, we can assume that the update was successful
      await onComplete()
    } catch (err) {
      if (err instanceof ZodError) {
        const error = fromZodError(err)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: error.message },
              error: {
                category: 'WRONG_INPUT',
                message: error.message,
              },
            },
          ],
        })
      } else if (isSendbirdDeskError(err)) {
        const events = sendbirdDeskErrorToActivityEvent(err)
        await onError({ events })
      } else {
        const message = (err as Error).message
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: message },
              error: {
                category: 'SERVER_ERROR',
                message,
              },
            },
          ],
        })
      }
    }
  },
}
