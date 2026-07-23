import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validateAndCreateStripeSdk } from '../../lib'

export const createSubscription: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createSubscription',
  category: Category.BILLING,
  title: 'Create subscription',
  description: 'Create a subscription in Stripe',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log(
      { meta, fields: payload.fields },
      'Processing createSubscription',
    )

    try {
      const {
        fields: input,
        stripe,
        patient,
        pathway,
        activity,
      } = await validateAndCreateStripeSdk({
        fieldsSchema: FieldsValidationSchema,
        payload,
      })

      const res = await stripe.subscriptions.create({
        customer: input.customer,
        items: [
          {
            price: input.item,
          },
        ],
        payment_settings: {
          payment_method_types: ['card'],
        },
        metadata: {
          awellPatientId: patient.id,
          awellCareflowId: pathway.id,
          awellActivityId: activity.id,
        },
      })

      await onComplete({
        data_points: {
          subscriptionId: res.id,
        },
      })
    } catch (err) {
      helpers.log({ meta, err }, 'error', err as Error)
      const error = err as Error
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: error.message },
            error: {
              category: 'SERVER_ERROR',
              message: error.message,
            },
          },
        ],
      })
    }
  },
}
