import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import {
  type ResourceTypeForConsolidation,
  resourceTypeForConsolidation,
} from '@metriport/api-sdk'
import { type settings } from '../../settings'
import { createMetriportApi } from '../../client'
import { handleErrorMessage } from '../../shared/errorHandler'
import { startConsolidatedQueryFields } from './fields'
import { consolidatedQueryDataPoints as dataPoints } from './dataPoints'
import { z } from 'zod'

const startConsolidatedQuerySchema = z.object({
  patientId: z
    .string({ errorMap: () => ({ message: 'Missing patientId' }) })
    .min(1),
  resources: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  conversionType: z.string().optional(),
})

export const startConsolidatedQuery: Action<
  typeof startConsolidatedQueryFields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'startConsolidatedQuery',
  category: Category.EHR_INTEGRATIONS,
  title: 'Start Consolidated Data Query',
  description:
    "Starts an asynchronous query for the Patient's consolidated FHIR data. Results are sent via webhooks.",
  fields: startConsolidatedQueryFields,
  previewable: false,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const { patientId, resources, dateFrom, dateTo, conversionType } =
        startConsolidatedQuerySchema.parse(payload.fields)

      const api = createMetriportApi(payload.settings)

      let resourceTypes: ResourceTypeForConsolidation[] | undefined
      if (resources !== undefined && resources.length > 0) {
        const validTypes = new Set<string>(resourceTypeForConsolidation)
        resourceTypes = resources
          .split(',')
          .map((r) => r.trim())
          .filter((r): r is ResourceTypeForConsolidation => validTypes.has(r))
      }

      const resp = await api.startConsolidatedQuery(
        patientId,
        resourceTypes,
        dateFrom,
        dateTo,
        conversionType,
      )

      await onComplete({
        data_points: {
          status: resp.status,
          requestId: resp.requestId ?? '',
        },
      })
    } catch (err) {
      await handleErrorMessage(err, onError)
    }
  },
}
