import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints } from './config'

export const createPatient: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createPatient',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create patient',
  description: 'Create a patient in Epic',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({payload, onComplete, onError}): Promise<void> => {
    await onComplete()
  },
}
