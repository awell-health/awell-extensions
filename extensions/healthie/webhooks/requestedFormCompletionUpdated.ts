import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { HEALTHIE_IDENTIFIER, type HealthieWebhookPayload } from '../lib/types'
import { type settings } from '../settings'
import { formatError } from '../lib/sdk/graphql-codegen/errors'
import { createSdk } from '../lib/sdk/graphql-codegen/createSdk'
import { webhookPayloadSchema } from '../lib/helpers'

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

      const validatedPayload = webhookPayloadSchema.parse(payload)
      const updatedFormCompletionId = validatedPayload.resource_id.toString()

      const response = await sdk.getRequestedFormCompletion({
        id: updatedFormCompletionId,
      })
      const healthiePatientId =
        response?.data?.requestedFormCompletion?.recipient_id
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
      await onError(formatError(error))
    }
  },
}

export type RequestFormCompletionUpdated = typeof requestFormCompletionUpdated
