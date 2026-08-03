import { type Action, Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { handleErrorMessage } from '../../shared/errorHandler'
import { fields } from './fields'
import { getWebhookBundleSchema } from './validation'
import { dataPoints } from './dataPoints'
import { fetchBundle } from './fetchBundle'
import { buildTransactionBundle } from './bundle'

export const getWebhookBundle: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getWebhookBundle',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get Webhook Bundle',
  description:
    'Fetches the FHIR bundle from a Metriport webhook payload URL (e.g. the Encounter Bundle from an ADT notification, or a discharge summary). The URL is provided by the realtime update webhook on the `bundleUrl` data point and is only valid for 10 minutes.',
  fields,
  previewable: true,
  supports_automated_retries: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const { url, eventType, provenanceReason } = getWebhookBundleSchema.parse(
        payload.fields,
      )

      const bundle = await fetchBundle(url)

      // Only ADT notifications carry Patient Encounter Bundles; for the other
      // webhook types this is undefined and the data point is simply omitted.
      // A collection bundle missing its Patient or Encounter throws instead —
      // it claims to be an encounter bundle but cannot be imported, so failing
      // the activity is better than silently emitting the raw bundle alone.
      const transactionBundle = buildTransactionBundle({
        bundle,
        awellPatientId: payload.patient.id,
        eventType,
        reason: provenanceReason,
      })

      await onComplete({
        data_points: {
          bundle: JSON.stringify(bundle),
          ...(transactionBundle !== undefined
            ? { transactionBundle: JSON.stringify(transactionBundle) }
            : {}),
        },
      })
    } catch (err) {
      await handleErrorMessage(err, onError)
    }
  },
}
