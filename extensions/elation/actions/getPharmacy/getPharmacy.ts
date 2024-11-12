import { z } from 'zod'

import { type Action, Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema, type settings } from '../../settings'
import { makeAPIClient } from '../../client'
import {
  FieldsValidationSchema,
  fields as elationFields,
  dataPoints,
} from './config'

export const getPharmacy: Action<typeof elationFields, typeof settings> = {
  key: 'getPharmacy',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get Pharmacy',
  description: "Retrieve a pharmacy profile using Elation's pharmacies API",
  fields: elationFields,
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete }): Promise<void> => {
    const { fields, settings } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
        settings: SettingsValidationSchema,
      }),
      payload,
    })

    const api = makeAPIClient(settings)

    const pharmacy = await api.getPharmacy(fields.ncpdpId.toString())

    await onComplete({
      data_points: {
        name: pharmacy.store_name,
        addressOne: pharmacy.address_line1,
        addressTwo: pharmacy.address_line2,
        city: pharmacy.city,
        state: pharmacy.state,
        zip: pharmacy.zip,
        phone: pharmacy.phone_primary,
        pharmacyObject: JSON.stringify(pharmacy),
      },
    })
  },
}
