import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { HEALTHIE_IDENTIFIER, type HealthieWebhookPayload } from '../lib/types'
import z from 'zod'
import { validateWebhookPayloadAndCreateSdk } from '../lib/sdk/validatePayloadAndCreateSdk'
import { type settings } from '../settings'

const payloadSchema = z
  .object({
    resource_id: z.string(),
  })
  .transform((data) => {
    return {
      createdGoalId: data.resource_id,
    }
  })

const dataPoints = {
  createdGoalId: {
    key: 'createdGoalId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const goalCreated: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload,
  typeof settings
> = {
  key: 'goalCreated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    try {
      const {
        validatedPayload: { createdGoalId },
        sdk,
      } = await validateWebhookPayloadAndCreateSdk({
        payloadSchema,
        payload,
        settings,
      })
      const response = await sdk.getGoal({ id: createdGoalId })
      const healthiePatientId = response?.data?.goal?.user_id
  
      await onSuccess({
        data_points: {
          createdGoalId,
        },
        ...(!isNil(healthiePatientId) && {
          patient_identifier: {
            system: HEALTHIE_IDENTIFIER,
            value: healthiePatientId,
          },
        }),
      })
    } catch (error) {
      console.log('Error in goalCreated webhook:', error)
      await onError(error)
    }
  }
}

export type GoalCreated = typeof goalCreated
