import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { validateAndCreateStripeSdk } from '../../lib'

export const createCustomer: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createCustomer',
  category: Category.BILLING,
  title: 'Create customer',
  description: 'Create a customer in Stripe',
  fields,
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    helpers.log({ fields: payload.fields }, 'Processing createCustomer')

    try {
      const {
        fields: input,
        stripe,
        patient,
      } = await validateAndCreateStripeSdk({
        fieldsSchema: FieldsValidationSchema,
        payload,
      })

      const res = await stripe.customers.create({
        email: input.email,
        name: input.name,
        metadata: {
          awellPatientId: patient.id,
        },
      })

      await onComplete({
        data_points: {
          customerId: res.id,
        },
      })
    } catch (err) {
      helpers.log({ err }, 'error', err as Error)
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
