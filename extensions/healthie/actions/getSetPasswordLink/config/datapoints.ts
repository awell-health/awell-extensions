import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  setPasswordLink: {
    key: 'setPasswordLink',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
