import { type BundleEntry, type Composition, type Procedure } from '@medplum/fhirtypes'
import { type ObjectStore } from '@awell-health/extensions-core'
import {
  extractDischargeSummary,
  type DischargeSummaryFields,
} from '../dischargeSummary'
import { readBundleEntries } from './readBundle'

/**
 * What `extractDischargeSummary` reads besides the reports its references lead
 * to. These are small and few: the Composition, the encounters, and the
 * conditions, procedures and care plans a summary lists.
 */
const READ_WHOLE: ReadonlySet<string> = new Set([
  'Composition',
  'Encounter',
  'Procedure',
  'CarePlan',
  'Condition',
])

/**
 * A copy that holds nothing of the chunks it was parsed from: a parsed value is
 * made of slices of them, and a slice keeps its whole chunk alive, so entries
 * scattered through the bundle would keep the bundle.
 */
const detached = (entry: BundleEntry): BundleEntry => JSON.parse(JSON.stringify(entry))

/** Every way a reference can name a resource of the bundle. */
const formsOf = (entry: BundleEntry): string[] => {
  const resource = entry.resource
  if (resource?.id === undefined) return []
  return [
    `${resource.resourceType}/${resource.id}`,
    `urn:uuid:${resource.id}`,
    ...(entry.fullUrl !== undefined ? [entry.fullUrl] : []),
  ]
}

/** The references a Composition's sections and the procedures it lists lead to. */
const referencesToFollow = (
  composition: Composition,
  procedures: Procedure[],
): Set<string> => {
  const wanted = new Set<string>()
  for (const section of composition.section ?? []) {
    for (const entry of section.entry ?? []) {
      if (entry.reference !== undefined) wanted.add(entry.reference)
    }
  }
  for (const procedure of procedures) {
    for (const report of procedure.report ?? []) {
      if (report.reference !== undefined) wanted.add(report.reference)
    }
  }
  return wanted
}

/**
 * The discharge summary fields of a stored bundle, read without holding it.
 *
 * `extractDischargeSummary` takes a whole bundle, and a discharge summary is
 * the one that can be largest: the reports that carry its notes hold the
 * documents themselves. So two passes read what it needs and no more: the few
 * resources it reads whole, then only the reports the document points at. The
 * extractor then runs, unchanged, on a bundle of those.
 *
 * Yields nothing for a bundle without a Composition, as the extractor does.
 */
export const readDischargeSummary = async (
  store: Pick<ObjectStore, 'getStream'>,
  ref: string,
): Promise<DischargeSummaryFields | undefined> => {
  const wholes: BundleEntry[] = []
  for await (const { entry } of readBundleEntries(store, ref)) {
    if (entry.resource !== undefined && READ_WHOLE.has(entry.resource.resourceType)) {
      wholes.push(detached(entry))
    }
  }

  const composition = wholes.find(
    (entry) => entry.resource?.resourceType === 'Composition',
  )?.resource as Composition | undefined
  if (composition === undefined) return undefined

  const procedures = wholes
    .map((entry) => entry.resource)
    .filter((resource): resource is Procedure => resource?.resourceType === 'Procedure')
  const wanted = referencesToFollow(composition, procedures)

  const reports: BundleEntry[] = []
  if (wanted.size > 0) {
    for await (const { entry } of readBundleEntries(store, ref)) {
      if (
        entry.resource?.resourceType === 'DiagnosticReport' &&
        formsOf(entry).some((form) => wanted.has(form))
      ) {
        reports.push(detached(entry))
      }
    }
  }

  return extractDischargeSummary({
    resourceType: 'Bundle',
    type: 'collection',
    entry: [...wholes, ...reports],
  })
}
