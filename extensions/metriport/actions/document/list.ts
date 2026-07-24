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
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log({ meta, fields: payload.fields }, 'Processing listDocs')

    try {
      const { patientId } = startQuerySchema.parse(payload.fields)

      const api = createMetriportApi(payload.settings)

      const resp = await api.listDocuments(patientId)

      await onComplete({
        data_points: {
          documents: JSON.stringify(resp.documents),
        },
      })
    } catch (err) {
      helpers.log({ meta, err }, 'error', err as Error)
      await handleErrorMessage(err, onError)
    }
  },
}
