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
  supports_automated_retries: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log({ meta, fields: payload.fields }, 'Processing getPharmacy')

    try {
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
    } catch (err) {
      helpers.log({ meta, err }, 'error', err as Error)
      const error = err as Error
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: error.message },
            error: {
              category: 'SERVER_ERROR',
              message: error.message,
            },
          },
        ],
      })
    }
  },
}
