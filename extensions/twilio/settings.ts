import { type ExtensionSetting } from '../../lib/types'

export const settings = {
  accountSid: {
    label: 'Account SID',
    key: 'accountSid',
    obfuscated: true,
    required: true,
    description: '',
  },
  authToken: {
    label: 'Auth token',
    key: 'authToken',
    obfuscated: true,
    required: true,
    description: '',
  },
  fromNumber: {
    label: 'From number',
    key: 'fromNumber',
    obfuscated: false,
    required: true,
    description: '',
  },
} satisfies Record<string, ExtensionSetting>
