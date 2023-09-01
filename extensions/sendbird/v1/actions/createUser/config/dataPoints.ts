import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  userId: {
    key: 'userId',
    /*
      User IDs are strings in Sendbird whereas customer IDs are integers
      https://sendbird.com/docs/chat/platform-api/v3/user/user-overview#2-resource-representation
    */
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
