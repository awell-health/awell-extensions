/* eslint-disable @typescript-eslint/no-non-null-assertion */
import sendgridMail, { type MailDataRequired } from '../sendgridSdk'
import {
  FieldType,
  StringType,
  type Action,
  type Field,
} from '../../../lib/types'
import { type settings } from '../settings'
import { getRecipientsFromCommaSeparatedEmails, getReplyTo } from './utils'
import { Category } from '../../../lib/types/marketplace'

const fields = {
  toEmails: {
    id: 'toEmails',
    label: 'To email(s)',
    type: FieldType.STRING,
    stringType: StringType.EMAIL,
    description:
      'Specify email addresses to send the email to. Separate multiple email addresses with a comma',
  },
  subject: {
    id: 'subject',
    label: 'Subject',
    type: FieldType.STRING,
    required: true,
    stringType: StringType.TEXT,
    description: 'Subject of the email',
  },
  bodyHtml: {
    id: 'bodyHtml',
    label: 'Content',
    type: FieldType.HTML,
    required: true,
    description: 'Content of the email',
  },
} satisfies Record<string, Field>

export const emailNotification: Action<typeof fields, typeof settings> = {
  key: 'emailNotification',
  title: 'Send email',
  category: Category.COMMUNICATION,
  description: 'Send email using Sendgrid API.',
  fields,
  onActivityCreated: async (payload, onComplete) => {
    const {
      fields: { toEmails, subject, bodyHtml },
      settings: { apiKey, fromEmail, fromName, replyToEmail, replyToName },
    } = payload

    try {
      sendgridMail.setApiKey(apiKey as string)

      const to = getRecipientsFromCommaSeparatedEmails({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        commaSeparatedEmails: toEmails!,
      })

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
        subject,
        html: bodyHtml!,
      }

      await sendgridMail.send(email)

      await onComplete()
    } catch (err) {
      console.error('Error in Sendgrid extension', err)
    }

    await onComplete()
  },
}
