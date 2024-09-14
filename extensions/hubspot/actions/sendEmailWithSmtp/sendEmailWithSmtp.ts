import { Category, type Action } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdks } from '../../lib'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'

export const sendEmailWithSmtp: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'sendEmailWithSmtp',
  category: Category.CUSTOMER_SUPPORT,
  title: 'Send email (SMTP)',
  description: 'Send email with SMTP',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const { hubSpotSmtpSdk, fields } = await validatePayloadAndCreateSdks({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    if (hubSpotSmtpSdk === undefined)
      throw new Error(
        'Could not instantiate SMTP client. Make sure the SMTP username and password are provided and valid.'
      )

    await hubSpotSmtpSdk.sendEmail(fields)

    await onComplete()
  },
}
