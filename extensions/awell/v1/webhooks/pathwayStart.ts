import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { isNil } from 'lodash'

const dataPoints = {} satisfies Record<string, DataPointDefinition>

export type PathwayStartPayload = Record<string, unknown>

export const pathwayStart: Webhook<
  keyof typeof dataPoints,
  PathwayStartPayload
> = {
  key: 'pathwayStart',
  description:
    'Start a pathway via webhook. No data points are expected nor required.',
  dataPoints,
  onWebhookReceived: async ({ payload }, onSuccess) => {
    if (!isNil(payload.patient_id)) {
      await onSuccess({
        data_points: {},
        patient_id: payload.patient_id.toString(),
      })
    } else {
      await onSuccess({
        data_points: {},
      })
    }
  },
}

export type PathwayStartWebhook = typeof pathwayStart
