import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { type FaxReceivedWebhookPayload } from './types'
import { zFaxReceivedWebhookPayload } from './types'

const dataPoints = {
  jobId: {
    key: 'jobId',
    valueType: 'string',
  },
  prod: {
    key: 'prod',
    valueType: 'string',
  },
  dir: {
    key: 'dir',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const faxReceived: Webhook<
  keyof typeof dataPoints,
  FaxReceivedWebhookPayload,
  typeof settings
> = {
  key: 'faxReceived',
  dataPoints,
  onEvent: async ({
    payload: { payload, rawBody, headers, settings },
    onSuccess,
    onError,
  }) => {
    const parsedPayload = zFaxReceivedWebhookPayload.safeParse(payload)

    if (!parsedPayload.success) {
      await onError({
        response: {
          statusCode: 400,
          message: JSON.stringify(parsedPayload.error, null, 2),
        },
      })
      return
    }

    await onSuccess({
      data_points: {
        jobId: parsedPayload.data.jobId,
        prod: parsedPayload.data.prod,
        dir: parsedPayload.data.dir,
      },
    })
  },
}

export type FaxReceived = typeof faxReceived
