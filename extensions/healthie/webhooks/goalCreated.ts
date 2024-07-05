import { isNil } from 'lodash'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'
import { HEALTHIE_IDENTIFIER, type HealthieWebhookPayload } from '../lib/types'
import { z, ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
// import { validateWebhookPayloadAndCreateSdk } from '../lib/sdk/validatePayloadAndCreateSdk'
import { type settings } from '../settings'
import { initialiseClient } from '../lib/sdk/graphqlClient'
import { getSdk } from '../lib/sdk/generated/sdk'
import { validate } from '@awell-health/extensions-core'

const payloadSchema = z
  .object({
    resource_id: z.union([z.string(), z.number()]),
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
      const { payload: validatedPayload } = validate({
        schema: z.object({
          payload: payloadSchema,
        }),
        payload,
      })
      const client = initialiseClient(settings)

      if (client === undefined)
        throw new Error(
          'There was a problem creating the Healthie GraphQL API Client. Please check your extension settings to validate the API URL and API Key.'
        )
  
      const sdk = getSdk(client)
      // const {
      //   validatedPayload,
      //   sdk,
      // } = await validateWebhookPayloadAndCreateSdk({
      //   payloadSchema,
      //   payload,
      //   settings,
      // })
      const createdGoalId = validatedPayload.resource_id;
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
      if (error instanceof ZodError) {
        const err = fromZodError(error)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: err.name },
              error: {
                category: 'WRONG_INPUT',
                message: `${err.message} for ${JSON.stringify(payload)} for schema ${JSON.stringify(payloadSchema)}`,
              },
            },
          ],
        })
      } else {
        console.log('Error in goalCreated webhook:', error)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'Unable to process goalCreated webhook' },
              error: {
                category: 'SERVER_ERROR',
                message: 'Unable to process goalCreated webhook',
              },
            },
          ],
        })
      }
    }
  }
}

export type GoalCreated = typeof goalCreated
