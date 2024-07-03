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
      updatedGoalId: data.resource_id,
    }
  })

const dataPoints = {
  updatedGoalId: {
    key: 'updatedGoalId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const goalUpdated: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload,
  typeof settings
> = {
  key: 'goalUpdated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    const {
      validatedPayload: { updatedGoalId },
      sdk,
    } = await validateWebhookPayloadAndCreateSdk({
      payloadSchema,
      payload,
      settings,
    })

    const response = await sdk.GetGoal({ id: updatedGoalId })
    const healthiePatientId = response?.data?.goal?.user_id
    await onSuccess({
      data_points: {
        updatedGoalId,
      },
      ...(!isNil(healthiePatientId) && {
        patient_identifier: {
          system: HEALTHIE_IDENTIFIER,
          value: healthiePatientId,
        },
      }),
    })
  }
}

export type GoalUpdated = typeof goalUpdated
