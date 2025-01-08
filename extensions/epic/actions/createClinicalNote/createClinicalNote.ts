import { Category, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints } from './config'

export const createClinicalNote: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createClinicalNote',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create clinical note',
  description: 'Create a clinical note in Epic',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({payload, onComplete, onError}): Promise<void> => {
    await onComplete()
  },
}
