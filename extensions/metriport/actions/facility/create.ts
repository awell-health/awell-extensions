import { type Action } from '../../../../lib/types'
import { Category } from '../../../../lib/types/marketplace'
import { type settings } from '../../settings'
import { createMetriportApi } from '../../client'
import { handleErrorMessage } from '../../shared/errorHandler'
import { facilityFields } from './fields'
import { facilityIdDataPoint } from './dataPoints'
import { facilityCreateSchema } from './validation'

export const createFacility: Action<
  typeof facilityFields,
  typeof settings,
  keyof typeof facilityIdDataPoint
> = {
  key: 'createFacility',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create Facility',
  description:
    'Creates a Facility in Metriport where your patients receive care.',
  fields: facilityFields,
  previewable: true,
  dataPoints: facilityIdDataPoint,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const facility = facilityCreateSchema.parse(payload.fields)

      const metriportFacility = {
        name: facility.name,
        npi: facility.npi,
        tin: facility.tin,
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

      const { id } = await api.createFacility(metriportFacility)

      await onComplete({
        data_points: {
          facilityId: String(id),
        },
      })
    } catch (err) {
      await handleErrorMessage(err, onError)
    }
  },
}
