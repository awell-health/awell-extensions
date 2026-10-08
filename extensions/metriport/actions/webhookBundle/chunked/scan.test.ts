import { TestHelpers, type ObjectStore } from '@awell-health/extensions-core'
import { scanBundle } from './scan'

const newStore = (): ObjectStore => TestHelpers.mockHelpers().objectStore

const scanOf = async (
  entries: unknown[],
  header: Record<string, unknown> = { type: 'collection', id: 'b-1' },
): ReturnType<typeof scanBundle> => {
  const store = newStore()
  const ref = await store.put(
    'a.json',
    JSON.stringify({ resourceType: 'Bundle', ...header, entry: entries }),
  )
  return await scanBundle(store, ref)
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
      expect(scan.maxRank).toBe(2)
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

    test('Should say there is no rank at all for a bundle with nothing to write', async () => {
      const scan = await scanOf([resource('Patient', 'p1')])

      expect(scan.maxRank).toBe(-1)
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
})
