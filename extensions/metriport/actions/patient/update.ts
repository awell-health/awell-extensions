import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
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
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    helpers.log({ fields: payload.fields }, 'Processing updatePatient')

    try {
      const patient = patientUpdateSchema.parse(payload.fields)

      const facilityId = stringId.parse(payload.fields.facilityId)

      const metriportPatient = convertToMetriportPatient(patient)

      const api = createMetriportApi(payload.settings)

      await api.updatePatient(
        { id: patient.id, ...metriportPatient },
        facilityId,
      )

      await onComplete()
    } catch (err) {
      helpers.log({ err }, 'error', err as Error)
      await handleErrorMessage(err, onError)
    }
  },
}
