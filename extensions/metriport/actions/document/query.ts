import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { createMetriportApi } from '../../client'
import { handleErrorMessage } from '../../shared/errorHandler'
import { queryFields } from './fields'
import { startQuerySchema } from './validation'
import { documentQueryDataPoints as dataPoints } from './dataPoints'

export const queryDocs: Action<
  typeof queryFields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'queryDocs',
  category: Category.EHR_INTEGRATIONS,
  title: 'Start Document Query',
  description:
    'Triggers a document query for the specified patient across HIEs.',
  fields: queryFields,
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log({ meta, fields: payload.fields }, 'Processing queryDocs')

    try {
      const { patientId, facilityId } = startQuerySchema.parse(payload.fields)

      const api = createMetriportApi(payload.settings)

      const resp = await api.startDocumentQuery(patientId, facilityId)

      await onComplete({
        data_points: {
          requestId: resp.requestId ?? '',
          downloadStatus: resp.download?.status ?? '',
          downloadTotal: String(resp.download?.total ?? 0),
          downloadSuccessful: String(resp.download?.successful ?? 0),
        },
      })
    } catch (err) {
      helpers.log({ meta, err }, 'error', err as Error)
      await handleErrorMessage(err, onError)
    }
  },
}
