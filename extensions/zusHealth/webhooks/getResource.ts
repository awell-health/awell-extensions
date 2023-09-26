import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { type EncounterWebhookPayload } from './types'
import { makeAPIClient } from '../client'

const dataPoints = {
  resourceData: {
    key: 'resourceData',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const getResource: Webhook<
  keyof typeof dataPoints,
  EncounterWebhookPayload
> = {
  key: 'getResource',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const { resourceId } = payload

    if (isNil(resourceId)) {
      await onError({
        // We should automatically send a 400 here, so no need to provide info
      })
    }

    const api = makeAPIClient(settings)
    const resourceData = await api.getResource(resourceId)

    await onSuccess({
      data_points: {
        resourceData: JSON.stringify(resourceData),
      },
    })
  },
}

export type GetResource = typeof getResource
