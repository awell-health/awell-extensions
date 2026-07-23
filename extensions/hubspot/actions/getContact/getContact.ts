import { Category, type Action } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdks } from '../../lib'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'

export const getcontact: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getcontact',
  category: Category.CUSTOMER_SUPPORT,
  title: 'Get contact',
  description: 'Retrieve the contact details from HubSpot',
  fields,
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log({ meta, fields: payload.fields }, 'Processing getcontact')

    try {
      const { hubSpotSdk, fields } = await validatePayloadAndCreateSdks({
        fieldsSchema: FieldsValidationSchema,
        payload,
      })

      const res = await hubSpotSdk.crm.contacts.basicApi.getById(
        fields.contactId,
      )

      await onComplete({
        data_points: {
          firstName: res.properties.firstname ?? undefined,
          lastName: res.properties.lastname ?? undefined,
          email: res.properties.email ?? undefined,
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
