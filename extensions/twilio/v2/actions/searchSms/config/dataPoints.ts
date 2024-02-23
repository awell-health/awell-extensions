import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  numberOfMessages: {
    key: 'numberOfMessages',
    valueType: 'number',
  },
  allMessages: {
    key: 'allMessages',
    valueType: 'strings_array',
  },
  latestMessage: {
    key: 'latestMessage',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
