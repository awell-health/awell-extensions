import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { createMetriportApi } from '../../client'
import { handleErrorMessage } from '../../shared/errorHandler'
import {
  findCohortByName,
  findFacilityByName,
  NameLookupError,
} from '../../shared/nameLookup'
import { convertToMetriportPatient } from '../patient/create'
import { patientIdDataPoint } from '../patient/dataPoints'
import { enrollInMonitoringFields } from './fields'
import { enrollInMonitoringSchema } from './validation'

/**
 * Joins the messages of every rejected lookup into one error. It stays a
 * `NameLookupError` (reported as `WRONG_INPUT`) only when each failure was
 * one; a Metriport request failure in either lookup makes it a server error.
 */
const combineLookupErrors = (
  results: Array<PromiseSettledResult<unknown>>,
): Error => {
  const errors = results.flatMap((r) =>
    r.status === 'rejected' ? [r.reason as Error] : [],
  )
  if (errors.length === 1) return errors[0]
  const message = errors.map((e) => e.message).join('. ')
  return errors.every((e) => e instanceof NameLookupError)
    ? new NameLookupError(message)
    : new Error(message)
}

export const enrollInMonitoring: Action<
  typeof enrollInMonitoringFields,
  typeof settings,
  keyof typeof patientIdDataPoint
> = {
  key: 'enrollInMonitoring',
  category: Category.EHR_INTEGRATIONS,
  title: 'Enroll in Monitoring',
  description:
    'Creates a Patient in Metriport and enrolls them in real-time monitoring. The Cohort is looked up by name, and the Patient is created in the Facility with the same name.',
  fields: enrollInMonitoringFields,
  previewable: true,
  supports_automated_retries: true,
  dataPoints: patientIdDataPoint,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    helpers.log({ fields: payload.fields }, 'Processing enrollInMonitoring')

    try {
      const { cohortName, ...patient } = enrollInMonitoringSchema.parse(
        payload.fields,
      )

      const api = createMetriportApi(payload.settings)

      // Every failed lookup is reported, so a Cohort or Facility renamed in
      // Metriport is called out by kind instead of one error hiding the other.
      const [cohortResult, facilityResult] = await Promise.allSettled([
        findCohortByName(api, payload.settings, cohortName),
        findFacilityByName(api, payload.settings, cohortName),
      ])
      if (
        cohortResult.status === 'rejected' ||
        facilityResult.status === 'rejected'
      ) {
        throw combineLookupErrors([cohortResult, facilityResult])
      }
      const cohort = cohortResult.value
      const facility = facilityResult.value

      const { id } = await api.createPatient(
        { ...convertToMetriportPatient(patient), cohorts: [cohort.id] },
        facility.id,
      )

      await onComplete({
        data_points: {
          patientId: String(id),
        },
      })
    } catch (err) {
      helpers.log({ err }, 'error', err as Error)
      await handleErrorMessage(err, onError)
    }
  },
}
