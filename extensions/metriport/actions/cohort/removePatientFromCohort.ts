import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { createMetriportApi } from '../../client'
import { handleErrorMessage } from '../../shared/errorHandler'
import { stringId } from '../../validation/generic.zod'
import { removePatientFromCohortFields } from './fields'
import { removePatientFromCohortDataPoints as dataPoints } from './dataPoints'

export const removePatientFromCohort: Action<
  typeof removePatientFromCohortFields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'removePatientFromCohort',
  category: Category.EHR_INTEGRATIONS,
  title: 'Remove Patient from Cohort',
  description: 'Removes the specified Patient from a cohort.',
  fields: removePatientFromCohortFields,
  previewable: true,
  supports_automated_retries: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const cohortId = stringId.parse(payload.fields.cohortId)
      const patientId = stringId.parse(payload.fields.patientId)

      const api = createMetriportApi(payload.settings)
      const { message, cohort } = await api.removePatientsFromCohort({
        cohortId,
        patientIds: [patientId],
      })

      await onComplete({
        data_points: {
          message,
          cohort: JSON.stringify(cohort),
        },
      })
    } catch (err) {
      await handleErrorMessage(err, onError)
    }
  },
}
