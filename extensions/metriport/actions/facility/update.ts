import { type Action } from '../../../../lib/types'
import { Category } from '../../../../lib/types/marketplace'
import { type settings } from '../../settings'
import { createMetriportApi } from '../../client'
import { handleErrorMessage } from '../../shared/errorHandler'
import { facilityWithIdFields } from './fields'
import { facilityUpdateSchema } from './validation'

export const updateFacility: Action<
  typeof facilityWithIdFields,
  typeof settings
> = {
  key: 'updateFacility',
  category: Category.EHR_INTEGRATIONS,
  title: 'Update Facility',
  description:
    'Updates a Facility in Metriport where your patients receive care.',
  fields: facilityWithIdFields,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const facility = facilityUpdateSchema.parse(payload.fields)

      const metriportFacility = {
        id: facility.id,
        name: facility.name,
        tin: facility.tin,
        npi: facility.npi,
        address: {
          addressLine1: facility.addressLine1,
          addressLine2: facility.addressLine2,
          city: facility.city,
          state: facility.state,
          zip: facility.zip,
          country: facility.country,
        },
      }

      const api = createMetriportApi(payload.settings)

      await api.updateFacility(metriportFacility)

      await onComplete()
    } catch (err) {
      await handleErrorMessage(err, onError)
    }
  },
}
