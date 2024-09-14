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
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const { hubSpotSdk, fields, activity } = await validatePayloadAndCreateSdks(
      {
        fieldsSchema: FieldsValidationSchema,
        payload,
      }
    )

    const res =
      await hubSpotSdk.marketing.transactional.singleSendApi.sendEmail({
        emailId: Number(fields.emailId),
        message: {
          _from: fields.from,
          to: fields.to,
          sendId: `awell_activity_${activity.id}`,
        },
        contactProperties: fields.contactProperties,
        customProperties: fields.customProperties,
      })

    await onComplete({
      data_points: {
        statusId: res.statusId,
      },
    })
  },
}
