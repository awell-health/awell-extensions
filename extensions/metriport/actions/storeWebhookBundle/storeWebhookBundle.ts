import { type Action, Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { handleErrorMessage } from '../../shared/errorHandler'
import { downloadBundle } from '../../shared/downloadBundle'
import { fields } from '../webhookBundle/fields'
import { buildTransactionChunks } from '../webhookBundle/chunked/buildChunks'
import { readDischargeSummary } from '../webhookBundle/chunked/dischargeSummary'
import { scanBundle } from '../webhookBundle/chunked/scan'
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
    'Downloads the FHIR bundle from a Metriport webhook payload URL into storage without loading it into memory, and returns a reference to it instead of the bundle. For an encounter bundle it also splits the bundle into transactions Medplum can execute one after another, and returns a reference to that list, for the "Execute stored bundle" action. Use it in place of "Get Webhook Bundle" when bundles can be too large to pass between care flow steps, such as a discharge summary. The URL is provided by the realtime update webhook on the `bundleUrl` data point and is only valid for 10 minutes.',
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

      // The bundle is never held. It goes from the download into storage as it
      // arrives, which has to start at once as the URL only lasts 10 minutes,
      // and is read back from there a piece at a time. There is no `log` either:
      // it would write every resource's identifiers (MRNs and the like) to the
      // logs, and a bundle can hold hundreds of thousands of resources.
      // The names are the activity's, so a retry replaces what a failed attempt stored.
      const prefix = `metriport/${payload.activity.id}`
      const { ref: bundleRef } = await downloadBundle({
        url,
        name: `${prefix}/bundle.json`,
        objectStore: helpers.objectStore,
      })

      const scan = await scanBundle(helpers.objectStore, bundleRef)

      // Only ADT notifications carry Patient Encounter Bundles; for the other
      // webhook types there is nothing to split and the reference is omitted. A
      // collection bundle missing its Patient or Encounter throws instead: it
      // claims to be an encounter bundle but cannot be imported, so failing the
      // activity is better than silently returning the raw bundle alone.
      const transactionBundleRef =
        scan.header.type === 'collection'
          ? (
              await buildTransactionChunks({
                store: helpers.objectStore,
                sourceRef: bundleRef,
                scan,
                namePrefix: `${prefix}/transaction`,
                awellPatientId: payload.patient.id,
                eventType,
                reason: provenanceReason,
              })
            ).manifestRef
          : undefined

      // The discharge summary fields are small by construction; they are
      // the one part of a summary that is meant to travel as data points.
      const dischargeSummary = scan.hasComposition
        ? await readDischargeSummary(helpers.objectStore, bundleRef)
        : undefined

      await onComplete({
        data_points: {
          bundleRef,
          ...(transactionBundleRef !== undefined ? { transactionBundleRef } : {}),
          ...(scan.encounterId !== undefined ? { encounterId: scan.encounterId } : {}),
          ...dischargeSummary,
        },
      })
    } catch (err) {
      await handleErrorMessage(err, onError)
    }
  },
}
