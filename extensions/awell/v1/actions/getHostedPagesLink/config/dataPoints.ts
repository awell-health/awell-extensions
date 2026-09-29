import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  linkUrl: {
    key: 'linkUrl',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
