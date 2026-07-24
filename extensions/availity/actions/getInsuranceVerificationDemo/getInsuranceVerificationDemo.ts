import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints } from './config'
import { isNil, sample } from 'lodash'

export const getInsuranceVerificationDemo: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getInsuranceVerificationDemo',
  category: Category.BILLING,
  title: 'Get insurance verification (demo)',
  description:
    'This is a dummy action that either returns a verified or unverified status.',
  fields,
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    helpers.log(
      { fields: payload.fields },
      'Processing getInsuranceVerificationDemo',
    )

    try {
      const options = [true, false]
      const random = sample(options)

      await onComplete({
        data_points: {
          verified: !isNil(random) ? JSON.stringify(random) : undefined,
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
