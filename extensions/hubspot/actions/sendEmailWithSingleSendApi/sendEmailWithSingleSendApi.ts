import { Category, type Action } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdks } from '../../lib'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'

export const sendEmailWithSingleSendApi: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'sendEmailWithSingleSendApi',
  category: Category.CUSTOMER_SUPPORT,
  title: 'Send email (Single Send API)',
  description: 'Send email with the Single Send API',
  fields,
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log(
      { meta, fields: payload.fields },
      'Processing sendEmailWithSingleSendApi',
    )

    try {
      const { hubSpotSdk, fields, activity } =
        await validatePayloadAndCreateSdks({
          fieldsSchema: FieldsValidationSchema,
          payload,
        })

      const requestBody = {
        emailId: Number(fields.emailId),
        message: {
          _from: fields.from,
          to: fields.to,
          sendId: `awell_activity_${activity.id}`,
        },
        contactProperties: fields.contactProperties,
        customProperties: fields.customProperties,
      }

      helpers.log(
        { meta, requestBody },
        'Sending email via HubSpot Single Send API',
      )
      const res =
        await hubSpotSdk.marketing.transactional.singleSendApi.sendEmail(
          requestBody,
        )

      await onComplete({
        data_points: {
          statusId: res.statusId,
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
