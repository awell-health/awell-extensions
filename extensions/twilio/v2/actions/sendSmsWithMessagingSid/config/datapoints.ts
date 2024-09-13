import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  /**
   * The Message SID is the unique ID for any message successfully created by Twilio’s API
   */
  messageSid: {
    key: 'messageSid',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
