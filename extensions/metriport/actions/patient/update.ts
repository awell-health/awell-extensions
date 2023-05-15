import { type Action } from '../../../../lib/types'
import { Category } from '../../../../lib/types/marketplace'
import { type settings } from '../../settings'
import { createMetriportApi } from '../../client'
import { handleErrorMessage } from '../../shared/errorHandler'
import { updateFields } from './fields'
import { stringId } from '../../validation/generic.zod'
import { patientUpdateSchema } from './validation'
import { convertToMetriportPatient } from './create'

export const updatePatient: Action<typeof updateFields, typeof settings> = {
  key: 'updatePatient',
  category: Category.EHR_INTEGRATIONS,
  title: 'Update Patient',
  description: 'Updates the specified Patient.',
  fields: updateFields,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const patient = patientUpdateSchema.parse(payload.fields)

      const facilityId = stringId.parse(payload.fields.facilityId)

      const metriportPatient = convertToMetriportPatient(patient)

      const api = createMetriportApi(payload.settings)

      await api.updatePatient(
        { id: patient.id, ...metriportPatient },
        facilityId
      )

      await onComplete()
    } catch (err) {
      await handleErrorMessage(err, onError)
    }
  },
}
