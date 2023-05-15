import { type Action, type DataPointDefinition } from '../../../../lib/types'
import { Category } from '../../../../lib/types/marketplace'
import { type settings } from '../../settings'
import { createMetriportApi } from '../../client'
import { handleErrorMessage } from '../../shared/errorHandler'
import { createFields } from './fields'
import { linkCreateSchema } from './validation'

const dataPoints = {
  patientId: {
    key: 'patientId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const createLink: Action<
  typeof createFields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createLink',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create Link',
  description: "Create an link using Metriport's API.",
  fields: createFields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const { patientId, linkSource, facilityId, entityId } =
        linkCreateSchema.parse(payload.fields)

      const api = createMetriportApi(payload.settings)

      await api.createLink(patientId, facilityId, entityId, linkSource)

      await onComplete({
        data_points: {
          patientId: String(patientId),
        },
      })
    } catch (err) {
      await handleErrorMessage(err, onError)
    }
  },
}
