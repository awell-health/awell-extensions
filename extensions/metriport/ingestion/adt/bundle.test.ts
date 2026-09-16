import { type Bundle, type Location } from '@medplum/fhirtypes'
import { resolveReference } from './bundle'

describe('Metriport - Ingestion - ADT bundle references', () => {
  const bundle: Bundle = {
    resourceType: 'Bundle',
    type: 'collection',
    entry: [
      {
        fullUrl: 'urn:uuid:3ca5e8d2-7c84-45ab-91e7-834f8becde12',
        resource: {
          resourceType: 'Location',
          id: '3ca5e8d2-7c84-45ab-91e7-834f8becde12',
          name: 'Memorial Hospital',
        },
      },
      {
        fullUrl: 'urn:uuid:49e3c8f1-d67a-47b8-b9a2-cf23e8d0e941',
        resource: {
          resourceType: 'Practitioner',
          id: '49e3c8f1-d67a-47b8-b9a2-cf23e8d0e941',
        },
      },
    ],
  }

  test('resolves the relative form Metriport references resources by', () => {
    expect(
      resolveReference<Location>(bundle, {
        reference: 'Location/3ca5e8d2-7c84-45ab-91e7-834f8becde12',
      }),
    ).toMatchObject({ name: 'Memorial Hospital' })
  })

  test('resolves the urn form the entries are keyed by', () => {
    expect(
      resolveReference<Location>(bundle, {
        reference: 'urn:uuid:3ca5e8d2-7c84-45ab-91e7-834f8becde12',
      }),
    ).toMatchObject({ name: 'Memorial Hospital' })
  })

  test('refuses a resource of a type the reference did not ask for', () => {
    expect(
      resolveReference(bundle, {
        reference: 'Location/49e3c8f1-d67a-47b8-b9a2-cf23e8d0e941',
      }),
    ).toBeUndefined()
  })

  test('resolves nothing for a reference that points outside the bundle', () => {
    expect(
      resolveReference(bundle, { reference: 'Location/somewhere-else' }),
    ).toBeUndefined()
  })

  test('resolves nothing for a reference that carries no pointer at all', () => {
    expect(
      resolveReference(bundle, { display: 'Memorial Hospital' }),
    ).toBeUndefined()
    expect(resolveReference(bundle, undefined)).toBeUndefined()
  })
})
