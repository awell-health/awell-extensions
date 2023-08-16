import { type Action } from '@awell-health/extensions-core'
import { fields } from './config'
import { Category } from '@awell-health/extensions-core'
import { validateSettings, type settings } from '../../../settings'
import mailgunSdk from '../../../common/sdk/mailgunSdk'
import { getApiUrl } from '../../../common/utils'
import { validateActionFields } from './config/fields'

export const sendEmail: Action<typeof fields, typeof settings> = {
  key: 'sendEmail',
  title: 'Send email',
  description: 'Send an email to a recipient of your choice.',
  category: Category.COMMUNICATION,
  fields,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError) => {
    const { to, subject, body } = validateActionFields(payload.fields)
    const { apiKey, domain, region, fromName, fromEmail, testMode } =
      validateSettings(payload.settings)

    const mg = mailgunSdk.client({
      username: 'api',
      key: apiKey,
      url: getApiUrl({ region }),
    })

    await mg.messages.create(domain, {
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject,
      html: body,
      'o:testmode': testMode,
    })

    await onComplete()
  },
}
