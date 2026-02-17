import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { createMetriportApi } from '../../client'
import { handleErrorMessage } from '../../shared/errorHandler'
import { startNetworkQueryFields } from './fields'
import { networkQueryDataPoints as dataPoints } from './dataPoints'
import { z } from 'zod'

const startNetworkQuerySchema = z.object({
  patientId: z
    .string({ errorMap: () => ({ message: 'Missing patientId' }) })
    .min(1),
})

export const startNetworkQuery: Action<
  typeof startNetworkQueryFields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'startNetworkQuery',
  category: Category.EHR_INTEGRATIONS,
  title: 'Start Network Query',
  description:
    'Triggers an asynchronous query for the specified Patient across available health data networks (HIEs, pharmacies, labs). Results are sent via webhooks.',
  fields: startNetworkQueryFields,
  previewable: false,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const { patientId } = startNetworkQuerySchema.parse(payload.fields)

      const api = createMetriportApi(payload.settings)

      const resp = await api.startNetworkQuery({
        patientId,
        sources: ['hie'],
      })

      await onComplete({
        data_points: {
          requestId: resp.requestId,
          status: resp.status,
        },
      })
    } catch (err) {
      await handleErrorMessage(err, onError)
    }
  },
}
