import { type Action } from '../../../../lib/types'
import { Category } from '../../../../lib/types/marketplace'
import { type settings } from '../../settings'
import { createMetriportApi } from '../../client'
import { handleErrorMessage } from '../../shared/errorHandler'
import { getFields } from './fields'
import { stringId } from '../../validation/generic.zod'
import { facilityDataPoints } from './dataPoints'

export const getFacility: Action<
  typeof getFields,
  typeof settings,
  keyof typeof facilityDataPoints
> = {
  key: 'getFacility',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get Facility',
  description: 'Gets a Facility',
  fields: getFields,
  previewable: true,
  dataPoints: facilityDataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const facilityId = stringId.parse(payload.fields.facilityId)

      const api = createMetriportApi(payload.settings)
      const facility = await api.getFacility(facilityId)

      await onComplete({
        data_points: {
          name: facility.name,
          tin: facility.tin,
          npi: facility.npi,
          active: String(facility.active),
          addressLine1: facility.address.addressLine1,
          addressLine2: facility.address.addressLine2,
          city: facility.address.city,
          state: facility.address.state,
          zip: facility.address.zip,
          country: facility.address.country,
        },
      })
    } catch (err) {
      await handleErrorMessage(err, onError)
    }
  },
}
