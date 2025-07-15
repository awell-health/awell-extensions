import { type ActivityEvent, type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib/validatePayloadAndCreateSdk'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { isNil } from 'lodash'
import { freshsalesMobilePhoneToE164 } from '../../lib/freshsalesMobilePhoneToE164/freshsalesMobilePhoneToE164'
import { AxiosError } from 'axios'
import { addActivityEventLog } from '../../../../src/lib/awell/addEventLog'

export const getLead: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getLead',
  category: Category.CUSTOMER_SUPPORT,
  title: 'Get lead',
  description: 'Get a lead from Freshsales.',
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

    try {
      const { data } = await freshsalesSdk.getLead(fields.leadId)

      await onComplete({
        data_points: {
          leadData: JSON.stringify(data),
          email: isNil(data.lead.email) ? undefined : data.lead.email,
          mobileNumber: getMobileNumberInE164(data.lead.mobile_number),
          address: isNil(data.lead.address) ? undefined : data.lead.address,
          city: isNil(data.lead.city) ? undefined : data.lead.city,
          state: isNil(data.lead.state) ? undefined : data.lead.state,
          zipcode: isNil(data.lead.zipcode) ? undefined : data.lead.zipcode,
          country: isNil(data.lead.country) ? undefined : data.lead.country,
          timeZone: isNil(data.lead.time_zone)
            ? undefined
            : data.lead.time_zone,
          displayName: isNil(data.lead.display_name)
            ? undefined
            : data.lead.display_name,
          firstName: isNil(data.lead.first_name)
            ? undefined
            : data.lead.first_name,
          lastName: isNil(data.lead.last_name)
            ? undefined
            : data.lead.last_name,
        },
        events: additionalLogs,
      })
    } catch (error) {
      // Some errors we want to handle explicitly for more human-readable logging
      if (error instanceof AxiosError) {
        const err = error as AxiosError

        if (err.response?.status === 404)
          await onError({
            events: [
              addActivityEventLog({
                message: 'Lead not found (404)',
              }),
            ],
          })
        return
      }

      // Throw all other errors
      throw error
    }
  },
}
