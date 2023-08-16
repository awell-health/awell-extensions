import { type Action } from '@awell-health/extensions-core'
import { fields } from './config'
import { Category } from '@awell-health/extensions-core'
import { validateSettings, type settings } from '../../../settings'
import mailgunSdk from '../../../common/sdk/mailgunSdk'
import { getApiUrl } from '../../../common/utils'
import { validateActionFields } from './config/fields'

export const sendEmailWithTemplate: Action<typeof fields, typeof settings> = {
  key: 'sendEmailWithTemplate',
  title: 'Send email with template',
  description: 'Send an email based on a template.',
  category: Category.COMMUNICATION,
  fields,
  onActivityCreated: async (payload, onComplete, onError) => {
    const { to, subject, template, variables } = validateActionFields(
      payload.fields
    )
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
      template,
      'h:X-Mailgun-Variables': JSON.stringify(variables),
      'o:testmode': testMode,
    })

    await onComplete()
  },
}
