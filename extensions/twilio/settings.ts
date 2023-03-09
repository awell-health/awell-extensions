import { type Setting } from '../../lib/types'

export const settings = {
  accountSid: {
    label: 'Account SID',
    key: 'accountSid',
    obfuscated: true,
    required: true,
    description: 'Find your Account SID at twilio.com/console',
  },
  authToken: {
    label: 'Auth token',
    key: 'authToken',
    obfuscated: true,
    required: true,
    description: 'Find your Auth Token at twilio.com/console',
  },
  fromNumber: {
    label: '"From" number',
    key: 'fromNumber',
    obfuscated: false,
    required: true,
    description:
      'From specified the Twilio phone number, short code, or messaging Service that will send the text messages. This must be a Twilio phone number that you own.',
  },
} satisfies Record<string, Setting>
