import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { HEALTHIE_IDENTIFIER, type HealthieWebhookPayload } from '../lib/types'
import { createSdk } from '../lib/sdk/createSdk'
import { type settings } from '../settings'
import { formatErrors } from '../lib/sdk/errors'

const dataPoints = {
  createdGoalId: {
    key: 'createdGoalId',
    valueType: 'number',
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
        sdk
      } = await createSdk({settings})


      const createdGoalId = payload.resource_id.toString();
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
      const formattedError = formatErrors(error)
      await onError(formattedError)
    }
  }
}

export type GoalCreated = typeof goalCreated


