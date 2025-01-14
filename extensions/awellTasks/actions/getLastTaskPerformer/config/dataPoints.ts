import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  stytchUserId: {
    key: 'stytchUserId',
    valueType: 'string',
  },
  email: {
    key: 'email',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
