import { type Action, Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { handleErrorMessage } from '../../shared/errorHandler'
import { fields } from './fields'
import { getWebhookBundleSchema } from './validation'
import { dataPoints } from './dataPoints'
import { fetchBundle } from './fetchBundle'

export const getWebhookBundle: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getWebhookBundle',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get Webhook Bundle',
  description:
    'Fetches the FHIR bundle from a Metriport webhook payload URL (e.g. the Encounter Bundle from an ADT notification, or a discharge summary). The URL is provided by the enrollment webhook on the `bundleUrl` data point and is only valid for 10 minutes.',
  fields,
  previewable: true,
  supports_automated_retries: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const { url } = getWebhookBundleSchema.parse(payload.fields)

      const bundle = await fetchBundle(url)

      await onComplete({
        data_points: {
          bundle: JSON.stringify(bundle),
        },
      })
    } catch (err) {
      await handleErrorMessage(err, onError)
    }
  },
}
