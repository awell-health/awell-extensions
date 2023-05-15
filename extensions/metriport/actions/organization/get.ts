import { type Action } from '../../../../lib/types'
import { Category } from '../../../../lib/types/marketplace'
import { type settings } from '../../settings'
import { createMetriportApi } from '../../client'
import { handleErrorMessage } from '../../shared/errorHandler'
import { type getFields } from './fields'
import { orgDataPoints } from './dataPoints'

export const getOrganization: Action<
  typeof getFields,
  typeof settings,
  keyof typeof orgDataPoints
> = {
  key: 'getOrganization',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get Organization',
  description: 'Gets the Organization representing your legal corporate entity',
  fields: {},
  previewable: true,
  dataPoints: orgDataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const api = createMetriportApi(payload.settings)
      const organization = await api.getOrganization()

      if (organization !== undefined) {
        await onComplete({
          data_points: {
            type: organization.type,
            name: organization.name,
            addressLine1: organization.location.addressLine1,
            addressLine2: organization.location.addressLine2,
            city: organization.location.city,
            state: organization.location.state,
            zip: organization.location.zip,
            country: organization.location.country,
          },
        })
      }

      throw new Error('Organization not found')
    } catch (err) {
      await handleErrorMessage(err, onError)
    }
  },
}
