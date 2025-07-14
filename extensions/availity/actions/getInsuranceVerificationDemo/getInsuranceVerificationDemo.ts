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
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete }): Promise<void> => {
    const options = [true, false]
    const random = sample(options)

    await onComplete({
      data_points: {
        verified: !isNil(random) ? JSON.stringify(random) : undefined,
      },
    })
  },
}
