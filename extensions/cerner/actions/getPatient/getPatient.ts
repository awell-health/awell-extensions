import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints } from './config'

export const getPatient: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getPatient',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get patient',
  description: 'Retrieve patient details from Epic',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({payload, onComplete, onError}): Promise<void> => {
    await onComplete()
  },
}
