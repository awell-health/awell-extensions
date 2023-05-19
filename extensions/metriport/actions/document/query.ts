import { type Action } from '../../../../lib/types'
import { Category } from '../../../../lib/types/marketplace'
import { type settings } from '../../settings'
import { createMetriportApi } from '../../client'
import { handleErrorMessage } from '../../shared/errorHandler'
import { listFields } from './fields'
import { startQuerySchema } from './validation'
import { documentsDataPoints as dataPoints } from './dataPoints'

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

      const resp = await api.startDocumentQuery(patientId, facilityId)

      await onComplete({
        data_points: {
          queryStatus: resp.queryStatus,
          queryProgressTotal: resp.queryProgress.total,
          queryProgressComplete: resp.queryProgress.complete,
        },
      })
    } catch (err) {
      await handleErrorMessage(err, onError)
    }
  },
}
