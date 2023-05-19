import { type Action } from '../../../../lib/types'
import { Category } from '../../../../lib/types/marketplace'
import { type settings } from '../../settings'
import { createMetriportApi } from '../../client'
import { handleErrorMessage } from '../../shared/errorHandler'
import { orgFields } from './fields'
import { orgIdDataPoint } from './dataPoints'
import { orgCreateSchema } from './validation'

export const createOrganization: Action<
  typeof orgFields,
  typeof settings,
  keyof typeof orgIdDataPoint
> = {
  key: 'createOrganization',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create Organization',
  description: 'Registers your Organization in Metriport.',
  fields: orgFields,
  previewable: true,
  dataPoints: orgIdDataPoint,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const organization = orgCreateSchema.parse(payload.fields)

      const metriportOrg = {
        name: organization.name,
        type: organization.type,
        location: {
          addressLine1: organization.addressLine1,
          addressLine2: organization.addressLine2,
          city: organization.city,
          state: organization.state,
          zip: organization.zip,
          country: organization.country,
        },
      }

      const api = createMetriportApi(payload.settings)

      const { id } = await api.createOrganization(metriportOrg)

      await onComplete({
        data_points: {
          organizationId: String(id),
        },
      })
    } catch (err) {
      await handleErrorMessage(err, onError)
    }
  },
}
