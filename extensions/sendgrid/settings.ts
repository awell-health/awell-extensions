import { type Setting } from '../../lib/types'

export const settings = {
  apiKey: {
    label: 'Sendgrid API Key',
    key: 'apiKey',
    obfuscated: true,
    required: true,
    description: 'API key used to authorize requests to the Sendgrid API',
  },
  fromEmail: {
    label: 'From email',
    key: 'fromEmail',
    obfuscated: false,
    required: true,
    description: `The 'From' email address used to deliver the message. This address should be a verified sender in your Twilio SendGrid account`,
  },
  fromName: {
    label: 'From name',
    key: 'fromName',
    obfuscated: false,
    description: 'A name or title associated with the sending email address',
  },
  replyToEmail: {
    label: 'Reply to email',
    key: 'replyToEmail',
    obfuscated: false,
    description:
      'The email address where any replies or bounces will be returned',
  },
  replyToName: {
    label: 'Reply to name',
    key: 'replyToName',
    obfuscated: false,
    description: 'A name or title associated with the reply-to email address',
  },
} satisfies Record<string, Setting>
