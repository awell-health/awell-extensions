import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  resourceId: {
    key: 'resourceId',
    valueType: 'string',
  },
  resourceType: {
    key: 'resourceType',
    valueType: 'string',
  },
  bundleId: {
    key: 'bundleId',
    valueType: 'string',
  },
  bundleType: {
    key: 'bundleType',
    valueType: 'string',
  },
  resourceIds: {
    key: 'resourceIds',
    valueType: 'string',
  },
  resourcesCreated: {
    key: 'resourcesCreated',
    valueType: 'json',
  },
  wasResourceFound: {
    key: 'wasResourceFound',
    valueType: 'boolean',
  },
} satisfies Record<string, DataPointDefinition>
