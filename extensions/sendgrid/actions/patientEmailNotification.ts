/* eslint-disable @typescript-eslint/no-non-null-assertion */
import sendgridMail, { type MailDataRequired } from '../sendgridSdk'
import {
  FieldType,
  StringType,
  type Action,
  type Field,
} from '../../../lib/types'
import { type settings } from '../settings'
import { getReplyTo } from './utils'

const fields = {
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

export const patientEmailNotification: Action<typeof fields, typeof settings> =
  {
    key: 'patientEmailNotification',
    title: 'Send email to patient',
    category: 'Communication',
    description: 'Send an email to patient.',
    fields,
    onActivityCreated: async (payload, onComplete) => {
      const {
        patient,
        fields: { subject, bodyHtml },
        settings: { apiKey, fromEmail, fromName, replyToEmail, replyToName },
      } = payload

      try {
        sendgridMail.setApiKey(apiKey as string)

        const to = patient.profile?.email

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
