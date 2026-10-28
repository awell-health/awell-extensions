import { type Bundle, type Condition } from '@medplum/fhirtypes'
import { findReferenced } from './bundle'

const condition = (id: string): Condition => ({
  resourceType: 'Condition',
  id,
  subject: { reference: 'Patient/p1' },
})

const bundle: Bundle = {
  resourceType: 'Bundle',
  type: 'collection',
  entry: [
    { fullUrl: 'urn:uuid:c1', resource: condition('c1') },
    { fullUrl: 'urn:uuid:c2', resource: condition('c2') },
    { resource: { resourceType: 'Location', id: 'c3' } },
  ],
}

describe('findReferenced', () => {
  test('finds a resource by `<type>/<id>` and by its `urn:uuid` full URL, in reference order', () => {
    expect(
      findReferenced<Condition>(bundle, 'Condition', [
        { reference: 'urn:uuid:c2' },
        { reference: 'Condition/c1' },
      ]).map(({ id }) => id),
    ).toEqual(['c2', 'c1'])
  })

  test('skips a reference the bundle does not hold, one of another type, and one with no reference', () => {
    expect(
      findReferenced<Condition>(bundle, 'Condition', [
        { reference: 'Condition/missing' },
        { reference: 'Location/c3' },
        { display: 'no reference' },
        undefined,
      ]),
    ).toEqual([])
  })

  test('returns a resource referenced twice once, so it is saved and pointed at once', () => {
    expect(
      findReferenced<Condition>(bundle, 'Condition', [
        { reference: 'Condition/c1' },
        { reference: 'urn:uuid:c1' },
      ]).map(({ id }) => id),
    ).toEqual(['c1'])
  })
})
