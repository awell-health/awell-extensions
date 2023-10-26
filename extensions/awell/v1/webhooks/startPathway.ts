import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'

const dataPoints = {
  receivedDate: {
    key: 'receivedDate',
    valueType: 'date',
  },
} satisfies Record<string, DataPointDefinition>

export type StartPathwayPayload = Record<string, unknown>

export const startPathway: Webhook<
  keyof typeof dataPoints,
  StartPathwayPayload
> = {
  key: 'startPathway',
  description:
    'Start a pathway via webhook. No data points are expected nor required.',
  dataPoints,
  onWebhookReceived: async ({ payload }, onSuccess) => {
    await onSuccess({
      data_points: {
        receivedDate: new Date().toISOString(),
      },
    })
  },
}

export type StartPathwayWebhook = typeof startPathway
