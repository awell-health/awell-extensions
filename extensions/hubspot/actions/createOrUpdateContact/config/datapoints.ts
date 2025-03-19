import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  hubspotContactId: {
    key: 'hubspotContactId',
    valueType: 'string',
  },
  contactResource: {
    key: 'contactResource',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>
