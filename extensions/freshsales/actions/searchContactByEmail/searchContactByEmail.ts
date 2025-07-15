import { type ActivityEvent, type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib/validatePayloadAndCreateSdk'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { isNil } from 'lodash'
import { freshsalesMobilePhoneToE164 } from '../../lib/freshsalesMobilePhoneToE164/freshsalesMobilePhoneToE164'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'

export const searchContactByEmail: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'searchContactByEmail',
  category: Category.CUSTOMER_SUPPORT,
  title: 'Search contact by email',
  description: 'Search a contact by email from Freshsales.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const { fields, freshsalesSdk } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const additionalLogs: ActivityEvent[] = []

    const getMobileNumberInE164 = (
      mobileNumber?: string | null,
    ): string | undefined => {
      try {
        return freshsalesMobilePhoneToE164(mobileNumber)
      } catch (error) {
        additionalLogs.push(
          addActivityEventLog({
            message:
              "Could not convert the lead's phone number to the E164 format. It will not be set in the data point.",
          }),
        )
        return undefined
      }
    }

    const { data } = await freshsalesSdk.searchContactByEmail(fields.email)

    if (data.meta.total === 0) {
      await onError({
        events: [
          addActivityEventLog({
            message: 'Contact not found',
          }),
        ],
      })
      return
    }

    if (data.meta.total > 1) {
      await onError({
        events: [
          addActivityEventLog({
            message: 'Multiple contacts found for the given email',
          }),
        ],
      })
      return
    }

    const contact = data.contacts[0]

    await onComplete({
      data_points: {
        contactData: JSON.stringify(contact),
        email: isNil(contact.email) ? undefined : contact.email,
        mobileNumber: getMobileNumberInE164(contact.mobile_number),
        city: isNil(contact.city) ? undefined : contact.city,
        country: isNil(contact.country) ? undefined : contact.country,
        displayName: isNil(contact.display_name)
          ? undefined
          : contact.display_name,
        firstName: isNil(contact.first_name) ? undefined : contact.first_name,
        lastName: isNil(contact.last_name) ? undefined : contact.last_name,
      },
      events: additionalLogs,
    })
  },
}
