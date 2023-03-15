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
import { Category } from '../../../lib/types/marketplace'

const fields = {
  templateId: {
    id: 'templateId',
    label: 'Template id',
    type: FieldType.STRING,
    stringType: StringType.TEXT,
    required: true,
    description:
      'ID of the dynamic template to use. You can find this in the Sendgrid UI',
  },
  templateData: {
    id: 'templateData',
    label: 'Dynamic template data',
    type: FieldType.JSON,
    description:
      'JSON object containing dynamic template data. You can use dynamic variables here',
  },
} satisfies Record<string, Field>

export const patientEmailNotificationWithTemplate: Action<
  typeof fields,
  typeof settings
> = {
  key: 'patientEmailNotificationWithTemplate',
  title: 'Send email to patient with template',
  category: Category.COMMUNICATION,
  description:
    'Send an email to Patient using dynamic template email via the Sendgrid API',
  fields,
  onActivityCreated: async (payload, onComplete) => {
    const {
      fields: { templateId, templateData },
      patient,
      settings: { apiKey, fromEmail, fromName, replyToEmail, replyToName },
    } = payload

    try {
      sendgridMail.setApiKey(apiKey as string)

      const to = patient.profile?.email

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
