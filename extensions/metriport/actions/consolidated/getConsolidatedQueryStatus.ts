import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { createMetriportApi } from '../../client'
import { handleErrorMessage } from '../../shared/errorHandler'
import { getConsolidatedQueryStatusFields } from './fields'
import { consolidatedQueryStatusDataPoints as dataPoints } from './dataPoints'
import { z } from 'zod'

const getConsolidatedQueryStatusSchema = z.object({
  patientId: z
    .string({ errorMap: () => ({ message: 'Missing patientId' }) })
    .min(1),
})

export const getConsolidatedQueryStatus: Action<
  typeof getConsolidatedQueryStatusFields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getConsolidatedQueryStatus',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get Consolidated Data Query Status',
  description:
    "Gets the status of a consolidated data query for a Patient. Use after starting a consolidated query to check if results are ready.",
  fields: getConsolidatedQueryStatusFields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const { patientId } = getConsolidatedQueryStatusSchema.parse(
        payload.fields,
      )

      const api = createMetriportApi(payload.settings)

      const resp = await api.getConsolidatedQueryStatus(patientId)

      await onComplete({
        data_points: {
          status: resp.status,
          queries: JSON.stringify(resp.queries),
        },
      })
    } catch (err) {
      await handleErrorMessage(err, onError)
    }
  },
}
