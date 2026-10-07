import { type Bundle } from '@medplum/fhirtypes'
import { type Helpers } from '@awell-health/extensions-core'
import { fetchBundle } from '../../shared/fetchBundle'
import { buildTransactionBundle } from './bundle'
import { findEncounterId } from './bundle/encounter'
import {
  extractDischargeSummary,
  type DischargeSummaryFields,
} from './dischargeSummary'

/**
 * Downloads a Metriport webhook bundle and derives what both bundle actions
 * hand on: the importable transaction rewrite, the Encounter's id, and, for a
 * discharge summary, the fields lifted from the document. They differ only in
 * how they publish the result.
 */
export const fetchWebhookBundle = async ({
  url,
  awellPatientId,
  eventType,
  reason,
  log,
}: {
  url: string
  awellPatientId: string
  eventType?: string
  reason?: string
  log?: Helpers['log']
}): Promise<{
  bundle: Bundle
  transactionBundle: Bundle | undefined
  encounterId: string | undefined
  /** Undefined for any bundle that is not a discharge summary document. */
  dischargeSummary: DischargeSummaryFields | undefined
}> => {
  const bundle = await fetchBundle(url)

  // Only ADT notifications carry Patient Encounter Bundles; for the other
  // webhook types the transaction bundle is undefined and simply omitted. A
  // collection bundle missing its Patient or Encounter throws instead: it
  // claims to be an encounter bundle but cannot be imported, so failing the
  // activity is better than silently emitting the raw bundle alone.
  const transactionBundle = buildTransactionBundle({
    bundle,
    awellPatientId,
    eventType,
    reason,
    log,
  })

  return {
    bundle,
    transactionBundle,
    encounterId: findEncounterId(bundle),
    dischargeSummary: extractDischargeSummary(bundle),
  }
}
