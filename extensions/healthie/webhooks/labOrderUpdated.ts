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
  updatedLabOrderId: {
    key: 'updatedLabOrderId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const labOrderUpdated: Webhook<
  keyof typeof dataPoints,
  HealthieWebhookPayload,
  typeof settings
> = {
  key: 'labOrderUpdated',
  dataPoints,
  onWebhookReceived: async ({ payload, settings }, onSuccess, onError) => {
    try {
      const { sdk } = await createSdk({ settings })
      const updatedLabOrderId = payload.resource_id.toString()

      const response = await sdk.getLabOrder({ id: updatedLabOrderId })
      const healthiePatientId = response?.data?.labOrder?.patient?.id
      await onSuccess({
        data_points: {
           updatedLabOrderId,
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

export type LabOrderUpdated = typeof labOrderUpdated
