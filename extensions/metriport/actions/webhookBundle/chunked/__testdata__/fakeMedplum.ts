import { type Bundle, type BundleEntry, type Resource } from '@medplum/fhirtypes'

/**
 * Enough of Medplum's transaction handling to check what a chunked import
 * relies on, and nothing it does not:
 *
 * - a transaction is all or nothing;
 * - a `urn:uuid` reference resolves only to an entry of the same bundle;
 * - a conditional reference must find a resource that already existed before
 *   the transaction began, and the Patient is one that does;
 * - a conditional update creates what it does not find, replaces what it finds
 *   once, and fails with 412 when it finds more than one;
 * - a conditional create (`ifNoneExist`) skips what already exists;
 * - a plain POST always creates.
 *
 * It matches `identifier=system|value`, `_tag=system|code` and `name:exact=...`.
 */
export interface FakeMedplum {
  /** What is stored, for assertions. */
  readonly resources: Resource[]
  /** The bundles that were executed, with how many entries each had. */
  log: Array<{ chunk: number; entries: number }>
  executeBatch: (bundle: Bundle) => Promise<Bundle>
  /** Awell's own record of the patient, which the Patient conditional reference finds. */
  withPatient: () => void
}

interface Item {
  id: string
  resource: Resource
}

export const fakeMedplum = ({
  patientIdentifier = 'https://awellhealth.com/patients|test-patient',
}: { patientIdentifier?: string } = {}): FakeMedplum => {
  let nextId = 1
  let stored: Item[] = []
  const log: Array<{ chunk: number; entries: number }> = []

  /** The searches a resource can be found by, in the form they are asked for in. */
  const keysOf = (resource: Resource): string[] => {
    const record = resource as {
      identifier?: Array<{ system?: string; value?: string }> | { system?: string; value?: string }
      meta?: { tag?: Array<{ system?: string; code?: string }> }
      name?: unknown
    }
    const type = resource.resourceType
    const keys: string[] = []
    if (Array.isArray(record.identifier)) {
      for (const i of record.identifier) keys.push(`${type}?identifier=${String(i.system)}|${String(i.value)}`)
    }
    for (const t of record.meta?.tag ?? []) keys.push(`${type}?_tag=${String(t.system)}|${String(t.code)}`)
    if (typeof record.name === 'string') keys.push(`${type}?name:exact=${record.name}`)
    return keys
  }

  const buildIndex = (items: Item[]): Map<string, Item[]> => {
    const index = new Map<string, Item[]>()
    for (const item of items) {
      for (const key of keysOf(item.resource)) {
        const found = index.get(key)
        if (found === undefined) index.set(key, [item])
        else found.push(item)
      }
    }
    return index
  }

  const SEARCHES = ['identifier=', '_tag=', 'name:exact=']
  const search = (index: Map<string, Item[]>, resourceType: string, query: string): Item[] => {
    if (!SEARCHES.some((name) => query.startsWith(name))) {
      throw new Error(`The fake does not match the search ${query}`)
    }
    return index.get(`${resourceType}?${query}`) ?? []
  }

  const referencesIn = (value: unknown, found: string[] = []): string[] => {
    if (Array.isArray(value)) value.forEach((item) => referencesIn(item, found))
    else if (value !== null && typeof value === 'object') {
      for (const [key, child] of Object.entries(value)) {
        if (key === 'reference' && typeof child === 'string') found.push(child)
        else referencesIn(child, found)
      }
    }
    return found
  }

  const fail = (status: number, message: string): never => {
    throw Object.assign(new Error(message), { status })
  }

  return {
    get resources(): Resource[] {
      return stored.map((item) => item.resource)
    },
    log,
    executeBatch: async (bundle: Bundle): Promise<Bundle> => {
      const before = stored
      const draft = stored.map((item) => ({ ...item }))
      // Looked up by search, so a bundle of thousands is not searched thousands of times.
      const beforeIndex = buildIndex(before)
      const draftIndex = buildIndex(draft)
      const add = (item: Item): void => {
        draft.push(item)
        for (const key of keysOf(item.resource)) {
          const found = draftIndex.get(key)
          if (found === undefined) draftIndex.set(key, [item])
          else found.push(item)
        }
      }
      const fullUrls = new Set((bundle.entry ?? []).map((entry) => entry.fullUrl))
      const responses: BundleEntry[] = []

      try {
        for (const entry of bundle.entry ?? []) {
          const resource = entry.resource
          const request = entry.request
          if (resource === undefined || request === undefined) fail(400, 'An entry needs a resource and a request')

          for (const reference of referencesIn(resource)) {
            if (reference.startsWith('urn:uuid:')) {
              if (!fullUrls.has(reference)) fail(400, `Unresolved reference ${reference}`)
            } else if (reference.includes('?')) {
              const [type, query] = reference.split('?')
              if (type === 'Patient' && query.endsWith(patientIdentifier)) continue
              if (search(beforeIndex, type, query).length === 0) {
                fail(400, `Conditional reference ${reference} matched nothing`)
              }
            }
          }

          const [method, url] = [request?.method, request?.url ?? '']
          const type = (resource as Resource).resourceType
          if (method === 'PUT' && url.includes('?')) {
            const found = search(draftIndex, type, url.split('?')[1])
            if (found.length > 1) fail(412, `${url} matched ${found.length} resources`)
            if (found.length === 1) {
              found[0].resource = { ...(resource as Resource), id: found[0].id }
              responses.push({ response: { status: '200', location: `${type}/${found[0].id}` } })
            } else {
              const id = String(nextId++)
              add({ id, resource: { ...(resource as Resource), id } })
              responses.push({ response: { status: '201', location: `${type}/${id}` } })
            }
          } else if (method === 'POST') {
            const ifNoneExist = request?.ifNoneExist
            const existing = ifNoneExist === undefined ? [] : search(draftIndex, type, ifNoneExist)
            if (existing.length > 0) {
              responses.push({ response: { status: '200', location: `${type}/${existing[0].id}` } })
            } else {
              const id = String(nextId++)
              add({ id, resource: { ...(resource as Resource), id } })
              responses.push({ response: { status: '201', location: `${type}/${id}` } })
            }
          } else {
            fail(400, `The fake does not handle ${String(method)} ${url}`)
          }
        }
      } catch (err) {
        stored = before
        throw err
      }

      stored = draft
      log.push({ chunk: log.length + 1, entries: bundle.entry?.length ?? 0 })
      return { resourceType: 'Bundle', type: 'transaction-response', entry: responses }
    },
    withPatient: () => {
      const patient: Resource = {
        resourceType: 'Patient',
        identifier: [{ system: patientIdentifier.split('|')[0], value: patientIdentifier.split('|')[1] }],
      }
      stored.push({ id: 'awell-patient', resource: patient })
    },
  }
}
