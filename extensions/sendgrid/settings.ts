import { type Setting } from '../../lib/types'

export const settings = {
  apiKey: {
    label: 'Sendgrid API Key',
    key: 'api_key',
    obfuscated: true,
    required: true,
    description: 'API key used to authorize requests to the Sendgrid API',
  },
  fromEmail: {
    label: 'From email',
    key: 'from_email',
    obfuscated: false,
    required: true,
    description: `The 'From' email address used to deliver the message. This address should be a verified sender in your Twilio SendGrid account`,
  },
  fromName: {
    label: 'From name',
    key: 'from_name',
    obfuscated: false,
    description: 'A name or title associated with the sending email address',
  },
  replyToEmail: {
    label: 'Reply to email',
    key: 'reply_to_email',
    obfuscated: false,
    description:
      'The email address where any replies or bounces will be returned',
  },
  replyToName: {
    label: 'Reply to name',
    key: 'reply_to_name',
    obfuscated: false,
    description: 'A name or title associated with the reply-to email address',
  },
} satisfies Record<string, Setting>
