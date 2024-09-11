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
  signedFormAnswerGroupId: {
    key: 'signedFormAnswerGroupId',
    valueType: 'string',
  },
  signedFormAnswerGroup: {
    key: 'signedFormAnswerGroup',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>

export const formAnswerGroupSigned: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload,
  typeof settings
> = {
  key: 'formAnswerGroupSigned',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    try {
      const { sdk } = await createSdk({ settings })

      const validatedPayload = webhookPayloadSchema.parse(payload)
      const signedFormAnswerGroupId = validatedPayload.resource_id.toString()

      const response = await sdk.getFormAnswerGroup({
        id: signedFormAnswerGroupId,
      })
      const healthiePatientId = response?.data?.formAnswerGroup?.user?.id
      await onSuccess({
        data_points: {
          signedFormAnswerGroupId,
          signedFormAnswerGroup: JSON.stringify(
            response?.data?.formAnswerGroup
          ),
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

export type FormAnswerGroupSigned = typeof formAnswerGroupSigned
