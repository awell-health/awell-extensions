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
  createdFormAnswerGroupId: {
    key: 'createdFormAnswerGroupId',
    valueType: 'string',
  },
  createdFormAnswerGroup: {
    key: 'createdFormAnswerGroup',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>

export const formAnswerGroupCreated: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload,
  typeof settings
> = {
  key: 'formAnswerGroupCreated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    try {
      const { sdk } = await createSdk({settings})
      const createdFormAnswerGroupId = payload.resource_id.toString();

      const response = await sdk.getFormAnswerGroup({
        id: createdFormAnswerGroupId,
      })
      const healthiePatientId = response?.data?.formAnswerGroup?.user?.id
      await onSuccess({
        data_points: {
          createdFormAnswerGroupId,
          createdFormAnswerGroup: JSON.stringify(response?.data?.formAnswerGroup),
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

export type FormAnswerGroupCreated = typeof formAnswerGroupCreated
