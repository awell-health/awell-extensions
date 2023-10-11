import { type Setting } from '@awell-health/extensions-core'

export const settings = {
  url: {
    key: 'url',
    label: 'URL',
    obfuscated: true,
    description:
      'The URL you want to use in order to test your local extensions',
  },
} satisfies Record<string, Setting>
