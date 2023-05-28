import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { createMetriportApi } from '../../client'
import { handleErrorMessage } from '../../shared/errorHandler'
import { listFields } from './fields'
import { startQuerySchema } from './validation'
import { documentsDataPoints as dataPoints } from './dataPoints'

export const listDocuments: Action<
  typeof listFields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'listDocs',
  category: Category.EHR_INTEGRATIONS,
  title: 'List Documents',
  description:
    'Queries for all available document metadata for the specified patient across HIEs.',
  fields: listFields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const { patientId, facilityId } = startQuerySchema.parse(payload.fields)

      const api = createMetriportApi(payload.settings)

      const resp = await api.listDocuments(patientId, facilityId)

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
