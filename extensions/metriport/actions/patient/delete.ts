import { type Action } from '../../../../lib/types'
import { Category } from '../../../../lib/types/marketplace'
import { type settings } from '../../settings'
import { createMetriportApi } from '../../client'
import { handleErrorMessage } from '../../shared/errorHandler'
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
    try {
      const patientId = stringId.parse(payload.fields.patientId)
      const facilityId = stringId.parse(payload.fields.facilityId)

      const api = createMetriportApi(payload.settings)
      await api.deletePatient(patientId, facilityId)

      await onComplete()
    } catch (err) {
      await handleErrorMessage(err, onError)
    }
  },
}
