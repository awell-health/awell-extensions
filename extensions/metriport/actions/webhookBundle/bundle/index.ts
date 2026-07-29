import {
  type Bundle,
  type BundleEntry,
  type Resource,
} from '@medplum/fhirtypes'
import { buildAccountOrganizationEntry } from './account'
import { buildResourceEntry } from './entries'
import { buildProvenance } from './provenance'
import { buildReferenceMap, rewriteReferences } from './references'

export interface BuildTransactionBundleArgs {
  /** The `collection` bundle fetched from Metriport's pre-signed URL. */
  bundle: Bundle
  /** The Awell patient id, used to resolve the Medplum Patient. */
  awellPatientId: string
  /** The Metriport webhook type, e.g. `patient.admit`. Drives Provenance.activity. */
  eventType?: string
  /** Free-text reason recorded on the Provenance. */
  reason?: string
  /** Fallback for `Provenance.recorded`; injectable so tests stay deterministic. */
  now?: string
}

/**
 * Converts a Metriport Patient Encounter Bundle into a bundle Medplum can
 * execute, plus a Provenance recording the import.
 *
 * Pure and synchronous: every lookup that would otherwise need a Medplum read
 * is expressed declaratively instead — a conditional reference for the Patient,
 * conditional updates for the Metriport resources, and `ifNoneExist` for the
 * account Organization.
 *
 * Returns `undefined` for a bundle that is not a `collection`, since that is
 * simply one of Metriport's other webhook types and the calling action still
 * has a raw `bundle` to emit.
 *
 * Throws when a `collection` bundle is missing its Patient or Encounter entry.
 * That combination is an encounter bundle that does not describe an encounter —
 * malformed rather than merely different — and every reference the
 * transformation rewrites hangs off those two resources, so there is nothing
 * sensible to import.
 *
 * https://docs.metriport.com/medical-api/handling-data/patient-encounter-bundle
 */
export const buildTransactionBundle = ({
  bundle,
  awellPatientId,
  eventType,
  reason,
  now,
}: BuildTransactionBundleArgs): Bundle | undefined => {
  if (bundle.type !== 'collection') return undefined

  // Entries are kept whole rather than reduced to resources: each one carries
  // the `fullUrl` Metriport assigned, which becomes the entry's local identity
  // in the transaction.
  const entries = (bundle.entry ?? []).filter(
    (entry): entry is BundleEntry & { resource: Resource } =>
      entry.resource !== undefined,
  )

  const hasPatient = entries.some(
    (entry) => entry.resource.resourceType === 'Patient',
  )
  const hasEncounter = entries.some(
    (entry) => entry.resource.resourceType === 'Encounter',
  )

  const missing = [
    ...(hasPatient ? [] : ['Patient']),
    ...(hasEncounter ? [] : ['Encounter']),
  ]

  if (missing.length > 0) {
    throw new Error(
      `[Metriport bundle] Collection bundle has no ${missing.join(
        ' or ',
      )} entry, so it is not a valid Patient Encounter Bundle`,
    )
  }

  const referenceMap = buildReferenceMap(bundle, awellPatientId)

  // The Patient is referenced conditionally rather than written: Medplum is the
  // source of truth for it, so Metriport demographics must not overwrite it.
  const resourceEntries: BundleEntry[] = entries
    .filter((entry) => entry.resource.resourceType !== 'Patient')
    .map((entry) =>
      buildResourceEntry(
        rewriteReferences(entry.resource, referenceMap),
        entry.fullUrl,
      ),
    )

  const provenance = buildProvenance({
    targetReferences: resourceEntries
      .map((entry) => entry.fullUrl)
      .filter((fullUrl): fullUrl is string => fullUrl !== undefined),
    sourceBundleId: bundle.id,
    recorded: bundle.timestamp ?? now ?? new Date().toISOString(),
    reason,
    eventType,
  })

  return {
    resourceType: 'Bundle',
    type: 'transaction',
    entry: [buildAccountOrganizationEntry(), ...resourceEntries, provenance],
  }
}
