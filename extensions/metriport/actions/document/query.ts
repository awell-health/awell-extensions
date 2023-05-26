import { type Action, Category } from '@awell-health/awell-extensions-types'
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
          queryProgressTotal: String(resp.queryProgress?.total),
          queryProgressComplete: String(resp.queryProgress?.completed),
        },
      })
    } catch (err) {
      await handleErrorMessage(err, onError)
    }
  },
}
