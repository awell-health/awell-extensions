import { type ActivityEvent, type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib/validatePayloadAndCreateSdk'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { isNil } from 'lodash'
import { freshsalesMobilePhoneToE164 } from '../../lib/freshsalesMobilePhoneToE164/freshsalesMobilePhoneToE164'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'

export const searchLeadByEmail: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'searchLeadByEmail',
  category: Category.CUSTOMER_SUPPORT,
  title: 'Search lead by email',
  description: 'Search a lead by email from Freshsales.',
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

    const { data } = await freshsalesSdk.searchLeadByEmail(fields.email)

    if (data.meta.total === 0) {
      await onError({
        events: [
          addActivityEventLog({
            message: 'Lead not found',
          }),
        ],
      })
      return
    }

    if (data.meta.total > 1) {
      await onError({
        events: [
          addActivityEventLog({
            message: 'Multiple leads found for the given email',
          }),
        ],
      })
      return
    }

    const lead = data.leads[0]

    await onComplete({
      data_points: {
        leadData: JSON.stringify(lead),
        email: isNil(lead.email) ? undefined : lead.email,
        mobileNumber: getMobileNumberInE164(lead.mobile_number),
        city: isNil(lead.city) ? undefined : lead.city,
        country: isNil(lead.country) ? undefined : lead.country,
        displayName: isNil(lead.display_name) ? undefined : lead.display_name,
        firstName: isNil(lead.first_name) ? undefined : lead.first_name,
        lastName: isNil(lead.last_name) ? undefined : lead.last_name,
      },
      events: additionalLogs,
    })
  },
}
