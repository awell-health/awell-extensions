import { type Action, type DataPointDefinition } from '../../../../lib/types'
import { Category } from '../../../../lib/types/marketplace'
import { type settings } from '../../settings'
import { createMetriportApi } from '../../client'
import { handleErrorMessage } from '../../shared/errorHandler'
import { listFields } from './fields'
import { startQuerySchema } from './validation'

const dataPoints = {
  patientId: {
    key: 'patientId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const queryDocs: Action<
  typeof listFields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'queryDocs',
  category: Category.EHR_INTEGRATIONS,
  title: 'Start Document Query',
  description:
    'Triggers a document query for the specified patient across HIEs.',
  fields: listFields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const { patientId, facilityId } = startQuerySchema.parse(payload.fields)

      const api = createMetriportApi(payload.settings)

      await api.startDocumentQuery(patientId, facilityId)

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
