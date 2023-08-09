import { isNil } from 'lodash'
import {
    type DataPointDefinition,
    type Webhook,
} from '@awell-health/extensions-core'
import { type HealthieWebhookPayload } from '../types'

const dataPoints = {
    updatedGoalId: {
        key: 'updatedGoalId',
        valueType: 'string',
    },
} satisfies Record<string, DataPointDefinition>

export const goalUpdated: Webhook<
    keyof typeof dataPoints,
    HealthieWebhookPayload
    > = {
    key: 'goalUpdated',
    dataPoints,
    onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
        const { resource_id: updatedGoalId } = payload

        if (isNil(updatedGoalId)) {
            await onError({
                // We should automatically send a 400 here, so no need to provide info
            })
        }

        await onSuccess({
            data_points: {
                updatedGoalId,
            },
        })
    },
}

export type GoalUpdated = typeof goalUpdated
