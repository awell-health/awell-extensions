import { TestHelpers, type ObjectStore } from '@awell-health/extensions-core'
import { scanBundle } from './scan'

const newStore = (): ObjectStore => TestHelpers.mockHelpers().objectStore

const scanOf = async (
  entries: unknown[],
  header: Record<string, unknown> = { type: 'collection', id: 'b-1' },
  limits?: Parameters<typeof scanBundle>[2],
): ReturnType<typeof scanBundle> => {
  const store = newStore()
  const ref = await store.put(
    'a.json',
    JSON.stringify({ resourceType: 'Bundle', ...header, entry: entries }),
  )
  return await scanBundle(store, ref, limits)
}

const resource = (
  resourceType: string,
  id: string,
  extra: Record<string, unknown> = {},
): { fullUrl: string; resource: Record<string, unknown> } => ({
  fullUrl: `urn:uuid:${id}`,
  resource: { resourceType, id, ...extra },
})

describe('Metriport - scanBundle', () => {
  test('Should report what the bundle is, and what it holds', async () => {
    const scan = await scanOf(
      [
        resource('Patient', 'p1'),
        resource('Encounter', 'e1'),
        resource('Encounter', 'e2'),
        resource('Condition', 'c1'),
      ],
      { type: 'collection', id: 'b-9', timestamp: '2026-10-01T00:00:00Z' },
    )

    expect(scan.header).toEqual({
      type: 'collection',
      id: 'b-9',
      timestamp: '2026-10-01T00:00:00Z',
    })
    expect(scan).toEqual(
      expect.objectContaining({
        entryCount: 4,
        hasPatient: true,
        hasEncounter: true,
        hasComposition: false,
        // The first Encounter, as findEncounterId reads it.
        encounterId: 'e1',
      }),
    )
  })

  test('Should say when there is no Patient, no Encounter or no id to find', async () => {
    const scan = await scanOf([resource('Condition', 'c1')])

    expect(scan).toEqual(
      expect.objectContaining({
        hasPatient: false,
        hasEncounter: false,
        encounterId: undefined,
      }),
    )
  })

  test('Should not count an entry that carries no resource', async () => {
    const scan = await scanOf([{ fullUrl: 'urn:uuid:x' }, resource('Encounter', 'e1')])

    expect(scan.entryCount).toBe(1)
  })

  test('Should note a Composition, as that is what makes it a document to read a summary from', async () => {
    const scan = await scanOf([resource('Composition', 'doc'), resource('Encounter', 'e1')], {
      type: 'document',
    })

    expect(scan.hasComposition).toBe(true)
  })

  test('Should name the type of the first resource, other than a Patient, that has no id', async () => {
    const scan = await scanOf([
      { resource: { resourceType: 'Patient' } },
      resource('Encounter', 'e1'),
      { resource: { resourceType: 'Observation' } },
      { resource: { resourceType: 'Condition' } },
    ])

    expect(scan.firstWithoutId).toBe('Observation')
  })

  describe('the order resources can be written in', () => {
    test('Should rank a resource after the resources it refers to, whichever order they come in', async () => {
      const scan = await scanOf([
        // The Observation comes first, before what it points at.
        resource('Observation', 'o1', { encounter: { reference: 'Encounter/e1' } }),
        resource('Encounter', 'e1', { serviceProvider: { reference: 'Organization/org1' } }),
        resource('Organization', 'org1'),
      ])

      expect(scan.ranks.get('Organization/org1')).toBe(0)
      expect(scan.ranks.get('Encounter/e1')).toBe(1)
      expect(scan.ranks.get('Observation/o1')).toBe(2)
    })

    test('Should follow a reference in any of the forms the bundle uses', async () => {
      const scan = await scanOf([
        resource('Encounter', 'e1'),
        resource('Observation', 'o1', { encounter: { reference: 'urn:uuid:e1' } }),
        {
          fullUrl: 'https://metriport.example/Practitioner/pr1',
          resource: { resourceType: 'Practitioner', id: 'pr1' },
        },
        resource('Condition', 'c1', {
          asserter: { reference: 'https://metriport.example/Practitioner/pr1' },
        }),
      ])

      expect(scan.ranks.get('Observation/o1')).toBe(1)
      expect(scan.ranks.get('Condition/c1')).toBe(1)
    })

    test('Should not make a reference to the Patient, or to something outside the bundle, a dependency', async () => {
      const scan = await scanOf([
        resource('Patient', 'p1'),
        resource('Observation', 'o1', {
          subject: { reference: 'Patient/p1' },
          performer: [{ reference: 'Practitioner/not-in-the-bundle' }],
        }),
      ])

      expect(scan.ranks.get('Observation/o1')).toBe(0)
      expect(scan.ranks.has('Patient/p1')).toBe(false)
    })

    test('Should find a reference however deep it is in the resource', async () => {
      const scan = await scanOf([
        resource('Encounter', 'e1'),
        resource('DiagnosticReport', 'd1', {
          result: [{ reference: 'Observation/o1' }],
          contained: [{ resourceType: 'Basic', subject: { reference: 'Encounter/e1' } }],
        }),
        resource('Observation', 'o1'),
      ])

      expect(scan.ranks.get('DiagnosticReport/d1')).toBe(1)
    })

    test('Should group resources that refer to each other, so that they are written together', async () => {
      const scan = await scanOf([
        // The Encounter lists its diagnoses, and each diagnosis points back at it.
        resource('Encounter', 'e1', { diagnosis: [{ condition: { reference: 'Condition/c1' } }] }),
        resource('Condition', 'c1', { encounter: { reference: 'Encounter/e1' } }),
        resource('Observation', 'o1', { encounter: { reference: 'Encounter/e1' } }),
      ])

      expect(scan.groupOf.get('Encounter/e1')).toBeDefined()
      expect(scan.groupOf.get('Condition/c1')).toBe(scan.groupOf.get('Encounter/e1'))
      expect(scan.groupOf.has('Observation/o1')).toBe(false)
      expect(scan.ranks.get('Observation/o1')).toBe((scan.ranks.get('Encounter/e1') as number) + 1)
    })

    // It has no `identifier` element, so nothing written in another chunk could refer to it by one.
    test('Should write a resource together with a resource that has no identifier element that it refers to', async () => {
      const scan = await scanOf([
        resource('Observation', 'o1', { derivedFrom: [{ reference: 'Binary/bin1' }] }),
        resource('Binary', 'bin1', { contentType: 'text/plain' }),
        resource('Observation', 'o2', { encounter: { reference: 'Encounter/e1' } }),
        resource('Encounter', 'e1'),
      ])

      expect(scan.groupOf.get('Observation/o1')).toBeDefined()
      expect(scan.groupOf.get('Binary/bin1')).toBe(scan.groupOf.get('Observation/o1'))
      expect(scan.ranks.get('Binary/bin1')).toBe(scan.ranks.get('Observation/o1'))
      // What refers to something that does have one is unaffected.
      expect(scan.groupOf.has('Observation/o2')).toBe(false)
    })

    test('Should rank nothing for a bundle with nothing to write', async () => {
      const scan = await scanOf([resource('Patient', 'p1')])

      expect(scan.ranks.size).toBe(0)
    })
  })

  test('Should resolve every form of a reference to the resource it means', async () => {
    const scan = await scanOf([
      resource('Patient', 'p1'),
      {
        fullUrl: 'https://metriport.example/Encounter/e1',
        resource: { resourceType: 'Encounter', id: 'e1' },
      },
    ])

    expect(scan.keyOf.get('Patient/p1')).toBe('Patient/p1')
    expect(scan.keyOf.get('urn:uuid:p1')).toBe('Patient/p1')
    expect(scan.keyOf.get('Encounter/e1')).toBe('Encounter/e1')
    expect(scan.keyOf.get('urn:uuid:e1')).toBe('Encounter/e1')
    expect(scan.keyOf.get('https://metriport.example/Encounter/e1')).toBe('Encounter/e1')
  })

  describe('what it will not index', () => {
    test('Should stop, saying so and nothing of the content, at more resources than the limit', async () => {
      const entries = Array.from({ length: 6 }, (_, i) => resource('Observation', `o${i}`))

      await expect(scanOf(entries, undefined, { maxResources: 5 })).rejects.toThrow(
        '[Metriport bundle] The bundle has more than 5 resources',
      )
    })

    test('Should read a bundle of exactly the limit', async () => {
      const entries = Array.from({ length: 5 }, (_, i) => resource('Observation', `o${i}`))

      await expect(scanOf(entries, undefined, { maxResources: 5 })).resolves.toBeDefined()
    })

    test('Should stop reading the stored bundle when it stops', async () => {
      const store = newStore()
      const ref = await store.put(
        'a.json',
        JSON.stringify({
          resourceType: 'Bundle',
          entry: Array.from({ length: 50 }, (_, i) => resource('Observation', `o${i}`)),
        }),
      )
      let opened: { destroyed: boolean } | undefined
      const watching = {
        getStream: async (r: string) => {
          const stream = await store.getStream(r)
          opened = stream
          return stream
        },
      }

      await expect(scanBundle(watching, ref, { maxResources: 3 })).rejects.toThrow()
      await new Promise((resolve) => setImmediate(resolve))

      expect(opened?.destroyed).toBe(true)
    })

    test('Should stop at references nested deeper than the limit, as each level is another read of the bundle', async () => {
      // Each refers to the one before: a chain five deep.
      const entries = Array.from({ length: 5 }, (_, i) =>
        resource('Observation', `o${i}`, i === 0 ? {} : { derivedFrom: [{ reference: `Observation/o${i - 1}` }] }),
      )

      await expect(scanOf(entries, undefined, { maxDepth: 3 })).rejects.toThrow(
        '[Metriport bundle] The references between the resources are nested more than 3 levels deep',
      )
      await expect(scanOf(entries, undefined, { maxDepth: 4 })).resolves.toBeDefined()
    })

    test('Should stop at a group of resources that refer to each other that is larger than the limit', async () => {
      // A hub that refers to every one of the others, and each of them back at it.
      const members = Array.from({ length: 4 }, (_, i) => `Condition/c${i}`)
      const entries = [
        resource('Encounter', 'e1', { diagnosis: members.map((reference) => ({ condition: { reference } })) }),
        ...members.map((_, i) => resource('Condition', `c${i}`, { encounter: { reference: 'Encounter/e1' } })),
      ]

      await expect(scanOf(entries, undefined, { maxRecordResources: 4 })).rejects.toThrow(
        '[Metriport bundle] Resources that refer to each other are more than 4 in one group',
      )
      await expect(scanOf(entries, undefined, { maxRecordResources: 5 })).resolves.toBeDefined()
    })

    test('Should note the position of the first resource whose id or type is not valid FHIR, without quoting it', async () => {
      const scan = await scanOf([
        resource('Encounter', 'e1'),
        resource('Observation', 'a,b|c'),
        resource('Observation', 'o3'),
        { resource: { resourceType: 'Obs/ervation', id: 'o4' } },
      ])

      expect(scan.firstInvalid).toBe(1)
    })

    test.each(['x1', 'a-b.c', 'A'.repeat(64)])('Should accept the id %p', async (id) => {
      expect((await scanOf([resource('Observation', id)])).firstInvalid).toBeUndefined()
    })

    test.each(['', 'a b', 'a,b', 'a|b', 'a&b=c', 'a$b', 'x'.repeat(65), 'é'])('Should not accept the id %p', async (id) => {
      expect((await scanOf([resource('Observation', id)])).firstInvalid).toBe(0)
    })
  })
})
