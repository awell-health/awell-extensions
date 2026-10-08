import { TestHelpers, type ObjectStore } from '@awell-health/extensions-core'
import { type Bundle, type BundleEntry, type Resource } from '@medplum/fhirtypes'
import { buildTransactionBundle } from '../bundle'
import { patientAdmitBundle } from '../bundle/__testdata__/patientAdmitBundle'
import { fakeMedplum } from './__testdata__/fakeMedplum'
import { buildTransactionChunks, DEFAULT_CHUNK_LIMITS } from './buildChunks'
import { type TransactionChunksManifest } from './manifest'
import { scanBundle } from './scan'

const newStore = (): ObjectStore => TestHelpers.mockHelpers().objectStore

const entryOf = (
  resourceType: string,
  id: string,
  extra: Record<string, unknown> = {},
): BundleEntry => ({
  fullUrl: `urn:uuid:${id}`,
  resource: { resourceType, id, ...extra } as Resource,
})

const patient = entryOf('Patient', 'p1', { name: [{ family: 'Source' }] })
const encounter = entryOf('Encounter', 'e1', { subject: { reference: 'Patient/p1' } })

const build = async (
  entries: BundleEntry[],
  options: {
    limits?: { maxEntries: number; maxBytes: number }
    header?: Record<string, unknown>
    store?: ObjectStore
    eventType?: string
    reason?: string
  } = {},
): Promise<{
  store: ObjectStore
  manifest: TransactionChunksManifest
  manifestRef: string
  chunks: Bundle[]
}> => {
  const store = options.store ?? newStore()
  const sourceRef = await store.put(
    'metriport/act-1/bundle.json',
    JSON.stringify({
      resourceType: 'Bundle',
      type: 'collection',
      id: 'source-1',
      timestamp: '2026-10-01T10:00:00.000Z',
      ...options.header,
      entry: entries,
    }),
  )
  const scan = await scanBundle(store, sourceRef)

  const { manifestRef, manifest } = await buildTransactionChunks({
    store,
    sourceRef,
    scan,
    namePrefix: 'metriport/act-1/transaction',
    awellPatientId: 'test-patient',
    eventType: options.eventType,
    reason: options.reason,
    limits: options.limits,
  })

  const chunks: Bundle[] = []
  for (const chunk of manifest.chunks) chunks.push(JSON.parse(await store.get(chunk.ref)))
  return { store, manifest, manifestRef, chunks }
}

const resourcesOf = (chunk: Bundle): Resource[] =>
  (chunk.entry ?? [])
    .map((entry) => entry.resource as Resource)
    .filter((r) => r.resourceType !== 'Provenance' && !(r.resourceType === 'Organization' && (r as any).name === 'Metriport Realtime Monitoring'))

describe('Metriport - buildTransactionChunks', () => {
  test('Should write the bundle as transactions, none over the entry limit, and say what it wrote', async () => {
    const observations = Array.from({ length: 23 }, (_, i) =>
      entryOf('Observation', `o${i}`, { encounter: { reference: 'Encounter/e1' } }),
    )

    const { manifest, chunks } = await build([patient, encounter, ...observations], {
      limits: { maxEntries: 5, maxBytes: 10_000_000 },
    })

    // 1 Encounter in the first rank, 23 Observations after it.
    expect(manifest.totalEntries).toBe(24)
    expect(manifest.chunks.map((chunk) => chunk.entries)).toEqual([1, 5, 5, 5, 5, 3])
    expect(chunks.every((chunk) => chunk.type === 'transaction')).toBe(true)
    expect(chunks.map((chunk) => resourcesOf(chunk).length)).toEqual([1, 5, 5, 5, 5, 3])
    expect(manifest.chunks.map((chunk) => chunk.rank)).toEqual([0, 1, 1, 1, 1, 1])
  })

  test('Should keep to the byte limit, and give a resource that alone is over it a chunk of its own', async () => {
    const note = 'x'.repeat(2000)
    const entries = [
      patient,
      encounter,
      entryOf('DocumentReference', 'huge', { description: 'y'.repeat(50_000), encounter: { reference: 'Encounter/e1' } }),
      entryOf('Observation', 'o1', { valueString: note, encounter: { reference: 'Encounter/e1' } }),
      entryOf('Observation', 'o2', { valueString: note, encounter: { reference: 'Encounter/e1' } }),
      entryOf('Observation', 'o3', { valueString: note, encounter: { reference: 'Encounter/e1' } }),
    ]

    const { manifest } = await build(entries, { limits: { maxEntries: 100, maxBytes: 5000 } })

    const counts = manifest.chunks.map((chunk) => chunk.entries)
    // The Encounter alone, the huge one alone, then the Observations two to a chunk.
    expect(counts).toEqual([1, 1, 2, 1])
  })

  test('Should hold every resource of the source exactly once, whatever the limits', async () => {
    const entries = [
      patient,
      encounter,
      ...Array.from({ length: 40 }, (_, i) =>
        entryOf(i % 2 === 0 ? 'Observation' : 'Condition', `r${i}`, {
          encounter: { reference: 'Encounter/e1' },
        }),
      ),
    ]

    for (const maxEntries of [1, 3, 7, 1000]) {
      const { chunks } = await build(entries, { limits: { maxEntries, maxBytes: 10_000_000 } })

      const written = chunks.flatMap((chunk) => resourcesOf(chunk)).map((r) => (r as any).identifier[0].value)
      expect(written.sort()).toEqual(
        entries.filter((e) => e.resource?.resourceType !== 'Patient').map((e) => e.resource?.id as string).sort(),
      )
    }
  })

  test('Should never write the Patient, and refer to it by the Awell identifier', async () => {
    const { chunks } = await build([patient, encounter])

    const all = JSON.stringify(chunks)
    expect(all).not.toContain('"resourceType":"Patient"')
    expect(all).toContain('Patient?identifier=https://awellhealth.com/patients|test-patient')
  })

  describe('references', () => {
    test('Should write a reference as a conditional one when what it points at is in an earlier chunk, and as the entry when it is in the same one', async () => {
      const entries = [
        patient,
        encounter,
        entryOf('Observation', 'o1', { encounter: { reference: 'Encounter/e1' } }),
      ]

      // Everything in one chunk is kept apart by rank, so Encounter and Observation never share one.
      const { chunks } = await build(entries)

      const observation = resourcesOf(chunks[1])[0] as any
      expect(observation.encounter.reference).toBe(
        'Encounter?identifier=https://metriport.com/fhir/encounter|e1',
      )
    })

    test('Should leave a reference to something outside the bundle as it is', async () => {
      const { chunks } = await build([
        patient,
        encounter,
        entryOf('Observation', 'o1', { performer: [{ reference: 'Practitioner/elsewhere' }] }),
      ])

      const observation = chunks
        .flatMap((chunk) => resourcesOf(chunk))
        .find((resource) => resource.resourceType === 'Observation') as any
      expect(observation.performer[0].reference).toBe('Practitioner/elsewhere')
    })

    test('Should send what a resource refers to in a chunk before it, whatever order the source has them in', async () => {
      const entries = [
        patient,
        // Deliberately last-to-first: each refers to the one after it.
        entryOf('Observation', 'o1', { encounter: { reference: 'Encounter/e1' }, hasMember: [{ reference: 'Observation/o2' }] }),
        entryOf('Observation', 'o2', { encounter: { reference: 'Encounter/e1' }, hasMember: [{ reference: 'Observation/o3' }] }),
        entryOf('Observation', 'o3', { encounter: { reference: 'Encounter/e1' } }),
        entryOf('Encounter', 'e1', { serviceProvider: { reference: 'Organization/org' } }),
        entryOf('Organization', 'org'),
      ]

      const { chunks } = await build(entries, { limits: { maxEntries: 1, maxBytes: 10_000_000 } })

      // The fake refuses a conditional reference to anything not written by an earlier transaction.
      const medplum = fakeMedplum()
      medplum.withPatient()
      for (const chunk of chunks) await medplum.executeBatch(chunk)
      const written = medplum.resources.filter((r) => (r as any).identifier !== undefined && r.resourceType !== 'Patient')
      expect(written).toHaveLength(5)
    })
  })

  describe('resources that refer to each other', () => {
    // The Encounter lists its diagnoses, and each diagnosis points back at the Encounter.
    const cyclic = (): BundleEntry[] => [
      patient,
      entryOf('Encounter', 'e1', {
        serviceProvider: { reference: 'Organization/org' },
        diagnosis: [{ condition: { reference: 'Condition/c1' } }, { condition: { reference: 'Condition/c2' } }],
      }),
      entryOf('Condition', 'c1', { encounter: { reference: 'Encounter/e1' } }),
      entryOf('Condition', 'c2', { encounter: { reference: 'Encounter/e1' } }),
      entryOf('Organization', 'org'),
      entryOf('Observation', 'o1', { encounter: { reference: 'Encounter/e1' } }),
    ]

    test('Should write them together in one chunk, however small the limit, with the references between them as entries', async () => {
      const { chunks } = await build(cyclic(), { limits: { maxEntries: 1, maxBytes: 10_000_000 } })

      const together = chunks.find((chunk) => resourcesOf(chunk).some((r) => r.resourceType === 'Encounter')) as Bundle
      expect(resourcesOf(together).map((r) => r.resourceType).sort()).toEqual(['Condition', 'Condition', 'Encounter'])
      const encounter = resourcesOf(together).find((r) => r.resourceType === 'Encounter') as any
      expect(encounter.diagnosis[0].condition.reference).toBe('urn:uuid:c1')
      const condition = resourcesOf(together).find((r) => r.resourceType === 'Condition') as any
      expect(condition.encounter.reference).toBe('urn:uuid:e1')
    })

    test('Should write what they refer to before them, and what refers to them after', async () => {
      const { chunks } = await build(cyclic(), { limits: { maxEntries: 1, maxBytes: 10_000_000 } })

      const order = chunks.map((chunk) => resourcesOf(chunk).map((r) => r.resourceType).join('+'))
      const at = (type: string): number => order.findIndex((entry) => entry.includes(type))
      expect(at('Organization')).toBeLessThan(at('Encounter'))
      expect(at('Encounter')).toBeLessThan(at('Observation'))
    })

    test('Should be executed by Medplum, resolving each reference', async () => {
      const { chunks } = await build(cyclic(), { limits: { maxEntries: 1, maxBytes: 10_000_000 } })
      const medplum = fakeMedplum()
      medplum.withPatient()

      for (const chunk of chunks) await medplum.executeBatch(chunk)

      expect(medplum.resources.filter((r) => r.resourceType === 'Condition')).toHaveLength(2)
    })

    test('Should count a record as the resources in it against the limit, and put no more than the limit in a chunk with it', async () => {
      // Four on their own and a record of three, all at one rank.
      const entries = [
        patient,
        entryOf('Organization', 'org'),
        ...[1, 2, 3, 4].map((n) => entryOf('Observation', `s${n}`, { performer: [{ reference: 'Organization/org' }] })),
        entryOf('Encounter', 'e1', {
          serviceProvider: { reference: 'Organization/org' },
          diagnosis: [{ condition: { reference: 'Condition/c1' } }, { condition: { reference: 'Condition/c2' } }],
        }),
        entryOf('Condition', 'c1', { encounter: { reference: 'Encounter/e1' } }),
        entryOf('Condition', 'c2', { encounter: { reference: 'Encounter/e1' } }),
      ]

      const { manifest } = await build(entries, { limits: { maxEntries: 5, maxBytes: 10_000_000 } })

      const sizes = manifest.chunks.filter((chunk) => chunk.rank === 1).map((chunk) => chunk.entries)
      expect(sizes.every((size) => size <= 5)).toBe(true)
      expect(sizes.reduce((a, b) => a + b, 0)).toBe(7)
      // The record of three is whole in one of them.
      expect(Math.max(...sizes)).toBeGreaterThanOrEqual(3)
    })

    test('Should never put two records in one chunk when together they are over the limit', async () => {
      const record = (n: number): BundleEntry[] => [
        entryOf('Encounter', `e${n}`, { diagnosis: [{ condition: { reference: `Condition/c${n}a` } }, { condition: { reference: `Condition/c${n}b` } }] }),
        entryOf('Condition', `c${n}a`, { encounter: { reference: `Encounter/e${n}` } }),
        entryOf('Condition', `c${n}b`, { encounter: { reference: `Encounter/e${n}` } }),
      ]

      const { manifest } = await build([patient, ...record(1), ...record(2)], {
        limits: { maxEntries: 4, maxBytes: 10_000_000 },
      })

      expect(manifest.chunks.map((chunk) => chunk.entries)).toEqual([3, 3])
    })

    test('Should count the entries of a chunk that is a group, and say so in the manifest', async () => {
      const { manifest } = await build(cyclic(), { limits: { maxEntries: 1, maxBytes: 10_000_000 } })

      expect(manifest.chunks.map((chunk) => chunk.entries)).toEqual([1, 3, 1])
      expect(manifest.totalEntries).toBe(5)
    })
  })

  describe('references in the forms a source uses', () => {
    const at = (type: string, id: string, extra: Record<string, unknown> = {}): BundleEntry => ({
      fullUrl: `https://api.metriport.example/fhir/${type}/${id}`,
      resource: { resourceType: type, id, ...extra } as Resource,
    })

    test('Should rewrite a reference between resources of a record to the fullUrl the source gave them, when it is not a urn', async () => {
      const entries = [
        at('Patient', 'p1'),
        at('Encounter', 'e1', { diagnosis: [{ condition: { reference: 'Condition/c1' } }] }),
        at('Condition', 'c1', { encounter: { reference: 'Encounter/e1' } }),
      ]

      const { chunks } = await build(entries)

      const resources = resourcesOf(chunks[0]) as any[]
      expect(resources.find((r) => r.resourceType === 'Encounter').diagnosis[0].condition.reference).toBe(
        'https://api.metriport.example/fhir/Condition/c1',
      )
      expect(resources.find((r) => r.resourceType === 'Condition').encounter.reference).toBe(
        'https://api.metriport.example/fhir/Encounter/e1',
      )
      const medplum = fakeMedplum()
      medplum.withPatient()
      await expect(medplum.executeBatch(chunks[0])).resolves.toBeDefined()
    })

    test.each(['Patient/p1', 'urn:uuid:p1', 'https://api.metriport.example/fhir/Patient/p1'])(
      'Should make the Patient, referred to as %s, the Awell Patient by its identifier',
      async (reference) => {
        const entries = [
          { fullUrl: 'https://api.metriport.example/fhir/Patient/p1', resource: { resourceType: 'Patient', id: 'p1' } as Resource },
          at('Encounter', 'e1', { subject: { reference } }),
        ]

        const { chunks } = await build(entries)

        expect((resourcesOf(chunks[0])[0] as any).subject.reference).toBe(
          'Patient?identifier=https://awellhealth.com/patients|test-patient',
        )
      },
    )
  })

  describe('a rerun after a failure part way', () => {
    test('Should write every entry in a form that replaces what an earlier run wrote', async () => {
      const entries = [
        patient,
        encounter,
        entryOf('Observation', 'o1', { encounter: { reference: 'Encounter/e1' } }),
      ]
      const { chunks } = await build(entries)

      for (const entry of chunks.flatMap((chunk) => chunk.entry ?? [])) {
        const { method, ifNoneExist } = entry.request ?? {}
        expect(method === 'PUT' || ifNoneExist !== undefined).toBe(true)
      }
    })

    // Medplum reserves `meta`, which would be the place to tag a resource that has no identifier to be found by.
    test('Should not specify meta on anything it writes', async () => {
      const { chunks } = await build([
        patient,
        entryOf('Encounter', 'e1', { meta: { account: [{ reference: 'Organization/other' }] } }),
        entryOf('Binary', 'bin1', { contentType: 'text/plain', meta: { tag: [{ code: 'x' }] } }),
        entryOf('Observation', 'o1', { derivedFrom: [{ reference: 'Binary/bin1' }] }),
      ])

      const metas = chunks.flatMap((chunk) => (chunk.entry ?? []).map((e) => (e.resource as { meta?: unknown }).meta))
      expect(metas.every((meta) => meta === undefined)).toBe(true)
    })

    test('Should leave nothing doubled when the whole import is sent again, or when it stops half way and is sent again', async () => {
      const entries = [
        patient,
        encounter,
        ...Array.from({ length: 12 }, (_, i) =>
          entryOf('Observation', `o${i}`, { encounter: { reference: 'Encounter/e1' } }),
        ),
      ]
      const { chunks } = await build(entries, { limits: { maxEntries: 4, maxBytes: 10_000_000 } })
      const medplum = fakeMedplum()
      medplum.withPatient()

      // First run fails after two chunks, then everything is sent again, then once more.
      for (const chunk of chunks.slice(0, 2)) await medplum.executeBatch(chunk)
      for (const chunk of chunks) await medplum.executeBatch(chunk)
      for (const chunk of chunks) await medplum.executeBatch(chunk)

      const counts: Record<string, number> = {}
      for (const resource of medplum.resources) counts[resource.resourceType] = (counts[resource.resourceType] ?? 0) + 1
      expect(counts).toEqual({
        Patient: 1,
        Organization: 1,
        Encounter: 1,
        Observation: 12,
        Provenance: chunks.length,
      })
    })

    test('Should write byte-for-byte the same chunks the second time, so the same resources are replaced', async () => {
      const entries = [
        patient,
        encounter,
        ...Array.from({ length: 9 }, (_, i) => entryOf('Condition', `c${i}`, { encounter: { reference: 'Encounter/e1' } })),
      ]
      const limits = { maxEntries: 4, maxBytes: 10_000_000 }

      const first = await build(entries, { limits })
      const second = await build(entries, { limits })

      expect(second.manifest.chunks.map((c) => c.ref)).toEqual(first.manifest.chunks.map((c) => c.ref))
      for (const [i, chunk] of second.chunks.entries()) expect(chunk).toEqual(first.chunks[i])
    })
  })

  describe('a resource type that has no identifier element', () => {
    const withBinary = (): BundleEntry[] => [
      patient,
      encounter,
      entryOf('Observation', 'o1', { encounter: { reference: 'Encounter/e1' }, derivedFrom: [{ reference: 'Binary/bin1' }] }),
      entryOf('Binary', 'bin1', { contentType: 'text/plain', data: 'aGk=' }),
      entryOf('Observation', 'o2', { encounter: { reference: 'Encounter/e1' } }),
    ]

    // Without an identifier, or a tag, nothing in another chunk could refer to it conditionally.
    test('Should be written in the same chunk as what refers to it, with the reference as the entry, however small the limit', async () => {
      const { chunks } = await build(withBinary(), { limits: { maxEntries: 1, maxBytes: 10_000_000 } })

      const together = chunks.find((chunk) => resourcesOf(chunk).some((r) => r.resourceType === 'Binary')) as Bundle
      expect(resourcesOf(together).map((r) => r.resourceType).sort()).toEqual(['Binary', 'Observation'])
      const observation = resourcesOf(together).find((r) => r.resourceType === 'Observation') as any
      expect(observation.derivedFrom[0].reference).toBe('urn:uuid:bin1')
    })

    test('Should be executed by Medplum, resolving the reference to it', async () => {
      const { chunks } = await build(withBinary(), { limits: { maxEntries: 1, maxBytes: 10_000_000 } })
      const medplum = fakeMedplum()
      medplum.withPatient()

      for (const chunk of chunks) await medplum.executeBatch(chunk)

      expect(medplum.resources.filter((r) => r.resourceType === 'Binary')).toHaveLength(1)
    })

    // Known limit, and as it always was: there is nothing to find it by, so a rerun writes it again.
    test('Should be written with a POST, so a rerun writes it again', async () => {
      const { chunks } = await build(withBinary())
      const binary = chunks.flatMap((chunk) => chunk.entry ?? []).find((e) => e.resource?.resourceType === 'Binary')

      expect(binary?.request?.method).toBe('POST')
    })
  })

  describe('the Provenance of each chunk', () => {
    test('Should record, in each chunk, the resources of that chunk, the source bundle and why', async () => {
      const { chunks } = await build(
        [patient, encounter, entryOf('Condition', 'c1'), entryOf('Condition', 'c2')],
        { limits: { maxEntries: 1, maxBytes: 10_000_000 }, eventType: 'patient.admit', reason: 'Inpatient admission' },
      )

      for (const chunk of chunks) {
        const provenance = chunk.entry?.find((e) => e.resource?.resourceType === 'Provenance')?.resource as any
        const targets = provenance.target.map((t: { reference: string }) => t.reference)
        const fullUrls = (chunk.entry ?? [])
          .filter((e) => e.resource?.resourceType !== 'Provenance' && (e.resource as any).name !== 'Metriport Realtime Monitoring')
          .map((e) => e.fullUrl)
        expect(targets).toEqual(fullUrls)
        expect(provenance.entity[0].what.identifier.value).toBe('source-1')
        expect(provenance.reason).toEqual([{ text: 'Inpatient admission' }])
        expect(provenance.recorded).toBe('2026-10-01T10:00:00.000Z')
        expect(provenance.activity.coding[0].code).toBe('A01')
      }
    })

    test('Should tell the Provenance of one chunk from another, so a rerun replaces each and no more', async () => {
      const { chunks } = await build([patient, encounter, entryOf('Condition', 'c1'), entryOf('Condition', 'c2')], {
        limits: { maxEntries: 1, maxBytes: 10_000_000 },
      })

      const urls = chunks.map((chunk) => chunk.entry?.find((e) => e.resource?.resourceType === 'Provenance')?.request?.url)

      expect(new Set(urls).size).toBe(chunks.length)
    })

    test('Should keep what the source bundle calls itself out of a search as it is, when it is not a valid id', async () => {
      const { chunks } = await build([patient, encounter], { header: { id: 'a|b,c&_id=other' } })

      const url = chunks[0].entry?.find((e) => e.resource?.resourceType === 'Provenance')?.request?.url as string
      expect(url).toMatch(/^Provenance\?agent-type=https:\/\/metriport\.com\/fhir\/import-chunk\|[A-Za-z0-9.-]+:1$/)
      expect(url).not.toContain('other')
    })

    test('Should include the account Organization in every chunk, as the Provenance names it as its agent', async () => {
      const { chunks } = await build([patient, encounter, entryOf('Condition', 'c1')], {
        limits: { maxEntries: 1, maxBytes: 10_000_000 },
      })

      for (const chunk of chunks) {
        expect(chunk.entry?.some((e) => (e.resource as any)?.name === 'Metriport Realtime Monitoring')).toBe(true)
      }
    })
  })

  test('Should write the same resource entries the single transaction does, when it all fits in one chunk', async () => {
    const store = newStore()
    const { chunks } = await build(patientAdmitBundle.entry as BundleEntry[], {
      store,
      header: { id: patientAdmitBundle.id, timestamp: patientAdmitBundle.timestamp },
    })
    const single = buildTransactionBundle({
      bundle: patientAdmitBundle as never,
      awellPatientId: 'test-patient',
    }) as Bundle

    // Entries only: the chunks differ in carrying one Provenance each, as POST and as a conditional update.
    const comparable = (bundle: Bundle): BundleEntry[] =>
      (bundle.entry ?? [])
        .filter(
          (e) =>
            e.resource?.resourceType !== 'Provenance' &&
            (e.resource as any)?.name !== 'Metriport Realtime Monitoring',
        )
        .sort((a, b) => String(a.fullUrl).localeCompare(String(b.fullUrl)))

    // One entry's references differ: they are conditional where the target is in an earlier chunk.
    const entriesOf = chunks.flatMap((chunk) => comparable(chunk))
    expect(entriesOf.map((e) => e.fullUrl).sort()).toEqual(comparable(single).map((e) => e.fullUrl).sort())
    expect(entriesOf.map((e) => e.request).sort((a, b) => String(a?.url).localeCompare(String(b?.url)))).toEqual(
      comparable(single).map((e) => e.request).sort((a, b) => String(a?.url).localeCompare(String(b?.url))),
    )
  })

  describe('what it will not write', () => {
    test('Should refuse a collection with no Patient or no Encounter, as the single transaction does', async () => {
      await expect(build([encounter])).rejects.toThrow(
        '[Metriport bundle] Collection bundle has no Patient entry, so it is not a valid Patient Encounter Bundle',
      )
      await expect(build([patient])).rejects.toThrow('has no Encounter entry')
      await expect(build([])).rejects.toThrow('has no Patient or Encounter entry')
    })

    test('Should refuse a resource with no id, naming its type but nothing of its content', async () => {
      const failure = await build([
        patient,
        encounter,
        { resource: { resourceType: 'Observation', valueString: 'MRN 12345' } as Resource },
      ]).catch((err: Error) => err)

      expect((failure as Error).message).toBe(
        '[Metriport bundle] Observation entry is missing an id, so it cannot be reconciled',
      )
    })

    test('Should refuse an id that is not valid FHIR, which is put in a search, naming where it is and nothing of what it says', async () => {
      const failure = await build([
        patient,
        encounter,
        entryOf('Observation', 'ok-1'),
        { resource: { resourceType: 'Observation', id: 'x,Encounter|e1', valueString: 'MRN 987654321' } as Resource },
      ]).catch((err: Error) => err)

      expect((failure as Error).message).toBe(
        '[Metriport bundle] Entry 3 has an id or resource type that is not valid FHIR',
      )
    })

    test('Should write nothing when it refuses', async () => {
      const store = newStore()

      await build([encounter], { store }).catch(() => undefined)

      expect(store.put).toHaveBeenCalledTimes(1) // the source itself
    })
  })

  test('Should never put the whole source, or more than a chunk, in one object', async () => {
    const entries = [
      patient,
      encounter,
      ...Array.from({ length: 200 }, (_, i) => entryOf('Observation', `o${i}`, { encounter: { reference: 'Encounter/e1' } })),
    ]
    const store = newStore()

    const { manifest } = await build(entries, { store, limits: { maxEntries: 20, maxBytes: 10_000_000 } })

    expect(manifest.chunks.length).toBe(11)
    for (const chunk of manifest.chunks) {
      expect(chunk.bytes).toBeLessThan(40_000)
    }
  })

  test('Should say where the entries of each chunk came from in the source', async () => {
    const entries = [
      patient,
      encounter,
      entryOf('Observation', 'o1', { encounter: { reference: 'Encounter/e1' } }),
      entryOf('Observation', 'o2', { encounter: { reference: 'Encounter/e1' } }),
      entryOf('Observation', 'o3', { encounter: { reference: 'Encounter/e1' } }),
    ]

    const { manifest } = await build(entries, { limits: { maxEntries: 2, maxBytes: 10_000_000 } })

    expect(manifest.chunks.map((c) => [c.firstSourceEntry, c.lastSourceEntry])).toEqual([
      [1, 1], // the Encounter, entry 1 of the source
      [2, 3],
      [4, 4],
    ])
  })
})
