import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { createMetriportApi } from '../../client'
import { stringId } from '../../validation/generic.zod'
import { deleteFields } from './fields'

export const deletePatient: Action<typeof deleteFields, typeof settings> = {
  key: 'deletePatient',
  category: Category.EHR_INTEGRATIONS,
  title: 'Delete Patient',
  description: 'Removes the specified Patient.',
  fields: deleteFields,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const patientId = stringId.parse(payload.fields.patientId)
    const facilityId = stringId.parse(payload.fields.facilityId)

    const api = createMetriportApi(payload.settings)
    await api.deletePatient(patientId, facilityId)

    await onComplete()
  },
}
