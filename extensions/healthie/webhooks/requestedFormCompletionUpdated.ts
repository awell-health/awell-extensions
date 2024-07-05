import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { HEALTHIE_IDENTIFIER, type HealthieWebhookPayload } from '../lib/types'
import { type settings } from '../settings'
import { formatErrors } from '../lib/sdk/errors'
import { createSdk } from '../lib/sdk/createSdk'

const dataPoints = {
  updatedFormCompletionId: {
    key: 'updatedFormCompletionId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const requestFormCompletionUpdated: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload,
  typeof settings
> = {
  key: 'requestFormCompletionUpdated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    try {
      const { sdk } = await createSdk({ settings })
      const updatedFormCompletionId = payload.resource_id.toString()

      const response = await sdk.getRequestedFormCompletion({ id: updatedFormCompletionId })
      const healthiePatientId = response?.data?.requestedFormCompletion?.recipient_id
      await onSuccess({
        data_points: {
          updatedFormCompletionId,
        },
        ...(!isNil(healthiePatientId) && {
          patient_identifier: {
            system: HEALTHIE_IDENTIFIER,
            value: healthiePatientId,
          },
        }),
      })
    } catch (error) {
      const formattedError = formatErrors(error)
      await onError(formattedError)
    }
  },
}

export type RequestFormCompletionUpdated = typeof requestFormCompletionUpdated
