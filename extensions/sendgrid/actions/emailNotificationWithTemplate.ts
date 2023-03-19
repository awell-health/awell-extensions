/* eslint-disable @typescript-eslint/no-non-null-assertion */
import sendgridMail, { type MailDataRequired } from '../sendgridSdk'
import {
  FieldType,
  StakeholdersMode,
  StringType,
  type Action,
  type Field,
} from '../../../lib/types'
import { type settings } from '../settings'
import { getRecipientsFromCommaSeparatedEmails, getReplyTo } from './utils'
import { Category } from '../../../lib/types/marketplace'

const fields = {
  toEmails: {
    id: 'to-emails',
    label: 'To email(s)',
    type: FieldType.STRING,
    stringType: StringType.EMAIL,
    description:
      'Specify email addresses to send the email to. Separate multiple email addresses with a comma',
  },
  templateId: {
    id: 'template-id',
    label: 'Template id',
    type: FieldType.STRING,
    stringType: StringType.TEXT,
    required: true,
    description:
      'ID of the dynamic template to use. You can find this in the Sendgrid UI',
  },
  templateData: {
    id: 'template-data',
    label: 'Dynamic template data',
    type: FieldType.JSON,
    description:
      'JSON object containing dynamic template data. You can use dynamic variables here',
  },
} satisfies Record<string, Field>

export const emailNotificationWithTemplate: Action<
  typeof fields,
  typeof settings
> = {
  key: 'emailNotificationWithTemplate',
  title: 'Send email with template',
  category: Category.COMMUNICATION,
  description: 'Send a dynamic template email via the Sendgrid API',
  fields,
  options: {
    stakeholders: {
      label: 'Send to patient',
      mode: StakeholdersMode.toggle,
      description:
        'If enabled and a patient email address is available in the patient profile, the email will be sent to the patient',
    },
  },
  onActivityCreated: async (payload, onComplete) => {
    const {
      fields: { toEmails, templateId, templateData },
      settings: { apiKey, fromEmail, fromName, replyToEmail, replyToName },
    } = payload

    try {
      sendgridMail.setApiKey(apiKey as string)

      const to = getRecipientsFromCommaSeparatedEmails({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        commaSeparatedEmails: toEmails!,
      })

      const dynamicTemplateData: MailDataRequired['dynamicTemplateData'] =
        JSON.parse(templateData as string)

      const replyTo = getReplyTo({
        fromName,
        fromEmail: fromEmail as string,
        replyToName,
        replyToEmail,
      })

      const email: MailDataRequired = {
        to,
        from: {
          name: fromName!,
          email: fromEmail!,
        },
        replyTo,
        templateId: templateId!,
        dynamicTemplateData: dynamicTemplateData!,
      }

      await sendgridMail.send(email)

      await onComplete()
    } catch (err) {
      console.error('Error in Sendgrid extension', err)
    }

    await onComplete()
  },
}
