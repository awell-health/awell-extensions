import { type Action, Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { handleErrorMessage } from '../../shared/errorHandler'
import { fields } from '../webhookBundle/fields'
import { fetchWebhookBundle } from '../webhookBundle/fetchWebhookBundle'
import { getWebhookBundleSchema } from '../webhookBundle/validation'
import { dataPoints } from './dataPoints'

export const storeWebhookBundle: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'storeWebhookBundle',
  category: Category.EHR_INTEGRATIONS,
  title: 'Store Webhook Bundle',
  description:
    'Fetches the FHIR bundle from a Metriport webhook payload URL and stores it, returning a reference to it instead of the bundle. Use it in place of "Get Webhook Bundle" when bundles can be too large to pass between care flow steps, such as a discharge summary. The URL is provided by the realtime update webhook on the `bundleUrl` data point and is only valid for 10 minutes.',
  fields,
  // A preview has no care flow to hand the references to.
  previewable: false,
  // Safe to retry: the objects are named after the activity, so a retry
  // replaces what the failed attempt stored.
  supports_automated_retries: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    try {
      const { url, eventType, provenanceReason } = getWebhookBundleSchema.parse(
        payload.fields,
      )

      // No `log`: it would write every resource's identifiers (MRNs and the
      // like) to the logs, and a bundle can hold tens of thousands of resources.
      const { bundle, transactionBundle, encounterId } =
        await fetchWebhookBundle({
          url,
          awellPatientId: payload.patient.id,
          eventType,
          reason: provenanceReason,
        })

      const objectName = (name: string): string =>
        `metriport/${payload.activity.id}/${name}.json`

      const bundleRef = await helpers.objectStore.put(
        objectName('bundle'),
        JSON.stringify(bundle),
      )
      const transactionBundleRef =
        transactionBundle === undefined
          ? undefined
          : await helpers.objectStore.put(
              objectName('transaction-bundle'),
              JSON.stringify(transactionBundle),
            )

      await onComplete({
        data_points: {
          bundleRef,
          ...(transactionBundleRef !== undefined ? { transactionBundleRef } : {}),
          ...(encounterId !== undefined ? { encounterId } : {}),
        },
      })
    } catch (err) {
      await handleErrorMessage(err, onError)
    }
  },
}
