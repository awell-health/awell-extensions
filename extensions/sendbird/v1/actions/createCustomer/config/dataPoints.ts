import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  customerId: {
    key: 'customerId',
    /*
      Customer IDs are integers in Sendbird whereas user IDs are strings
      https://sendbird.com/docs/desk/platform-api/v1/features/customer#2-resource-representation
    */
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>
