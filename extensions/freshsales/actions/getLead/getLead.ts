import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib/validatePayloadAndCreateSdk'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { isNil } from 'lodash'

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
  onEvent: async ({ payload, onComplete }): Promise<void> => {
    const { fields, freshsalesSdk } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const { data } = await freshsalesSdk.getLead(fields.leadId)

    await onComplete({
      data_points: {
        leadData: JSON.stringify(data),
        email: isNil(data.lead.email) ? undefined : data.lead.email,
        workNumber: isNil(data.lead.work_number)
          ? undefined
          : data.lead.work_number,
        mobileNumber: isNil(data.lead.mobile_number)
          ? undefined
          : data.lead.mobile_number,
        address: isNil(data.lead.address) ? undefined : data.lead.address,
        city: isNil(data.lead.city) ? undefined : data.lead.city,
        state: isNil(data.lead.state) ? undefined : data.lead.state,
        zipcode: isNil(data.lead.zipcode) ? undefined : data.lead.zipcode,
        country: isNil(data.lead.country) ? undefined : data.lead.country,
        timeZone: isNil(data.lead.time_zone) ? undefined : data.lead.time_zone,
        displayName: isNil(data.lead.display_name)
          ? undefined
          : data.lead.display_name,
        firstName: isNil(data.lead.first_name)
          ? undefined
          : data.lead.first_name,
        lastName: isNil(data.lead.last_name) ? undefined : data.lead.last_name,
      },
    })
  },
}
