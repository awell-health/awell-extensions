import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { createMetriportApi } from '../../client'
import { handleErrorMessage } from '../../shared/errorHandler'
import { getByNameFields } from './fields'
import { getByNameSchema } from './validation'
import { facilityDataPoints as dataPoints } from './dataPoints'

/**
 * Metriport types the optional Facility values as nullable, and `state` as
 * `unknown`, so they are normalised to a data point value or left unset.
 */
const asDataPoint = (value: unknown): string | undefined =>
  value === undefined || value === null ? undefined : String(value)

export const getFacilityByName: Action<
  typeof getByNameFields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getFacilityByName',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get Facility by Name',
  description:
    'Gets the Facility with the given name by listing all Facilities in your Organization and matching on the name.',
  fields: getByNameFields,
  previewable: true,
  supports_automated_retries: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    helpers.log({ fields: payload.fields }, 'Processing getFacilityByName')

    try {
      const { facilityName } = getByNameSchema.parse(payload.fields)

      const api = createMetriportApi(payload.settings)

      /**
       * Metriport has no endpoint to filter Facilities by name, so the full
       * list is fetched and matched in memory. An Organization holds a handful
       * of Facilities, so the list is small enough to scan on every activity.
       */
      const facilities = await api.listFacilities()
      const target = facilityName.toLowerCase()
      const matches = facilities.filter(
        (facility) => facility.name.trim().toLowerCase() === target,
      )

      if (matches.length !== 1) {
        const message =
          matches.length === 0
            ? `No Facility found with the name "${facilityName}"`
            : `${matches.length} Facilities found with the name "${facilityName}". The name must identify exactly one Facility.`

        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: message },
              error: {
                category: 'WRONG_INPUT',
                message,
              },
            },
          ],
        })
        return
      }

      const [facility] = matches

      await onComplete({
        data_points: {
          facilityId: facility.id,
          facilityName: facility.name,
          npi: facility.npi,
          tin: asDataPoint(facility.tin),
          active: asDataPoint(facility.active),
          addressLine1: facility.address.addressLine1,
          addressLine2: asDataPoint(facility.address.addressLine2),
          city: facility.address.city,
          state: asDataPoint(facility.address.state),
          zip: facility.address.zip,
          country: asDataPoint(facility.address.country),
        },
      })
    } catch (err) {
      helpers.log({ err }, 'error', err as Error)
      await handleErrorMessage(err, onError)
    }
  },
}
