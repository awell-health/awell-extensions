import { type Action, type DataPointDefinition } from '../../../../lib/types'
import { Category } from '../../../../lib/types/marketplace'
import { type settings } from '../../settings'
import { createMetriportApi } from '../../client'
import { handleErrorMessage } from '../../shared/errorHandler'
import { getAllFields } from './fields'
import { getAllLinksSchema } from './validation'

// NEED TO SEE WHILE TESTING
const dataPoints = {
  patientId: {
    key: 'patientId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const getAllLinks: Action<
  typeof getAllFields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getAllLinks',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get All Links',
  description: "Get all links using Metriport's API.",
  fields: getAllFields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const { patientId, facilityId } = getAllLinksSchema.parse(payload.fields)

      const api = createMetriportApi(payload.settings)

      await api.listLinks(patientId, facilityId)

      await onComplete()
    } catch (err) {
      await handleErrorMessage(err, onError)
    }
  },
}
