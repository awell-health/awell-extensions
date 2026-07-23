import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
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
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log({ meta, fields: payload.fields }, 'Processing deletePatient')

    try {
      const patientId = stringId.parse(payload.fields.patientId)
      const facilityId = stringId.parse(payload.fields.facilityId)

      const api = createMetriportApi(payload.settings)
      await api.deletePatient(patientId, facilityId)

      await onComplete()
    } catch (err) {
      helpers.log({ meta, err }, 'error', err as Error)
      await handleErrorMessage(err, onError)
    }
  },
}
