import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  nickname: {
    key: 'nickname',
    valueType: 'string',
  },
  accessToken: {
    key: 'accessToken',
    valueType: 'string',
  },
  isActive: {
    key: 'isActive',
    valueType: 'boolean',
  },
  createdAt: {
    key: 'createdAt',
    valueType: 'date',
  },
  lastSeenAt: {
    key: 'lastSeenAt',
    valueType: 'date',
  },
  hasEverLoggedIn: {
    key: 'hasEverLoggedIn',
    valueType: 'boolean',
  },
  metadata: {
    key: 'metadata',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
