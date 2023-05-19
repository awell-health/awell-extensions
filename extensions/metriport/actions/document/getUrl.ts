import { type Action } from '../../../../lib/types'
import { Category } from '../../../../lib/types/marketplace'
import { type settings } from '../../settings'
import { createMetriportApi } from '../../client'
import { handleErrorMessage } from '../../shared/errorHandler'
import { getUrlFields } from './fields'
import { startQuerySchema } from './validation'
import { documentUrlPoints as dataPoints } from './dataPoints'

export const getUrl: Action<
  typeof getUrlFields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getUrl',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get Document URL',
  description:
    'Fetches the document from S3 and sends a presigned URL.',
  fields: getUrlFields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const { patientId, facilityId } = startQuerySchema.parse(payload.fields)

      const api = createMetriportApi(payload.settings)

      const resp = await api.getDocumentUrl(patientId, facilityId)

      await onComplete({
        data_points: {
          url: resp.url,
        },
      })
    } catch (err) {
      await handleErrorMessage(err, onError)
    }
  },
}
