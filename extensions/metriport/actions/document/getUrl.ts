import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { createMetriportApi } from '../../client'
import { handleErrorMessage } from '../../shared/errorHandler'
import { getUrlFields } from './fields'
import { getUrlSchema } from './validation'
import { documentUrlPoints as dataPoints } from './dataPoints'

export const getUrl: Action<
  typeof getUrlFields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getUrl',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get Document URL',
  description: 'Fetches the document from S3 and sends a presigned URL.',
  fields: getUrlFields,
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log({ meta, fields: payload.fields }, 'Processing getUrl')

    try {
      const { fileName } = getUrlSchema.parse(payload.fields)

      const api = createMetriportApi(payload.settings)

      const resp = await api.getDocumentUrl(fileName)

      await onComplete({
        data_points: {
          url: resp.url,
        },
      })
    } catch (err) {
      helpers.log({ meta, err }, 'error', err as Error)
      await handleErrorMessage(err, onError)
    }
  },
}
