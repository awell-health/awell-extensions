import { type Action } from '../../../../lib/types'
import { Category } from '../../../../lib/types/marketplace'
import { type settings } from '../../settings'
import { createMetriportApi } from '../../client'
import { handleErrorMessage } from '../../shared/errorHandler'
import { orgWithIdFields } from './fields'
import { orgUpdateSchema } from './validation'

export const updateOrganization: Action<
  typeof orgWithIdFields,
  typeof settings
> = {
  key: 'updateOrganization',
  category: Category.EHR_INTEGRATIONS,
  title: 'Update Organization',
  description: "Updates your Organization's details.",
  fields: orgWithIdFields,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const organization = orgUpdateSchema.parse(payload.fields)

      const metriportOrg = {
        id: organization.id,
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

      await api.updateOrganization(metriportOrg)

      await onComplete()
    } catch (err) {
      await handleErrorMessage(err, onError)
    }
  },
}
