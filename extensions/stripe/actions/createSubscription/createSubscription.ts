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
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
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
  },
}
