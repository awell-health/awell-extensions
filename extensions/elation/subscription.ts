import { Fields, FieldType, Subscription } from '@awell-health/extensions-core'
import { settings } from './settings'
import { makeAPIClient } from './client'

const fields = {
  eventType: {
    id: 'eventType',
    label: 'Event Type',
    type: FieldType.STRING,
    description: 'The event type to subscribe to',
    required: true,
    options: {
      dropdownOptions: [
        {
          label: 'Patient',
          value: 'patient',
        },
        {
          label: 'Appointment',
          value: 'appointment',
        },
      ],
    },
  },
  properties: {
    id: 'properties',
    label: 'Properties',
    type: FieldType.JSON,
    description: 'The properties to include in the webhook',
    required: false,
  },
} satisfies Fields

export const subscription: Subscription<typeof fields, typeof settings> = {
  fields,
  onCreate: async ({ payload, onComplete, onError }) => {
    try {
      const api = makeAPIClient(payload.settings)
      if (payload.fields.eventType === undefined) {
        throw new Error('The event type is necessary in order to subscribe')
      }
      const subscription = await api.createSubscription({
        resource: payload.fields.eventType || 'patient',
        target: payload.url,
        properties: (payload.fields.properties as string) || null,
      })

      await onComplete({
        id: String(subscription.id),
        signingKey: subscription.signing_pub_key,
        metadata: {
          resource: subscription.resource,
          target: subscription.target,
        },
      })
    } catch (error) {
      await onError({
        message:
          error instanceof Error
            ? error.message
            : 'Failed to create subscription',
      })
    }
  },
  onDelete: async ({ payload, onComplete, onError }) => {
    try {
      const api = makeAPIClient(payload.settings)
      await api.deleteSubscription(Number(payload.subscriptionId))
      await onComplete({
        id: payload.subscriptionId,
      })
    } catch (error) {
      await onError({
        message:
          error instanceof Error
            ? error.message
            : 'Failed to delete subscription',
      })
    }
  },
}
