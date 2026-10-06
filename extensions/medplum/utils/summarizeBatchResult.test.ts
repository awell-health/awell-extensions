import { type Bundle } from '@medplum/fhirtypes'
import { summarizeBatchResult, summarizeBundleResult } from './summarizeBatchResult'

const summarize = (
  entry: Bundle['entry'],
  rest: Partial<Bundle> = {},
): ReturnType<typeof summarizeBatchResult> =>
  summarizeBatchResult({ resourceType: 'Bundle', entry, ...rest } as Bundle)

describe('Medplum - summarizeBatchResult', () => {
  test('Should read the id, type and location from the response location', () => {
    const result = summarize(
      [{ response: { status: '201 Created', location: 'Patient/p1/_history/1' } }],
      { id: 'bundle-1', type: 'transaction-response' },
    )

    expect(result).toEqual({
      bundleId: 'bundle-1',
      bundleType: 'transaction-response',
      resourceIds: 'p1',
      resourcesCreated: JSON.stringify([
        { id: 'p1', resourceType: 'Patient', status: '201 Created', location: 'Patient/p1' },
      ]),
    })
  })

  test('Should fall back to the resource when the entry has no location', () => {
    const result = summarize([
      { response: { status: '200 OK' }, resource: { resourceType: 'Encounter', id: 'e1' } as never },
    ])

    expect(result.resourceIds).toBe('e1')
    expect(JSON.parse(result.resourcesCreated)).toEqual([
      { id: 'e1', resourceType: 'Encounter', status: '200 OK', location: 'Encounter/e1' },
    ])
  })

  test('Should leave out an entry that has no id', () => {
    const result = summarize([
      { response: { status: '201 Created' } },
      { response: { status: '201 Created', location: 'Patient/p1/_history/1' } },
    ])

    expect(result.resourceIds).toBe('p1')
    expect(JSON.parse(result.resourcesCreated)).toHaveLength(1)
  })

  test('Should give an empty status when the entry has none', () => {
    const result = summarize([{ response: { status: undefined as never, location: 'Patient/p1' } }])

    expect(JSON.parse(result.resourcesCreated)[0].status).toBe('')
  })

  test('Should summarize a result with no entries as empty', () => {
    expect(summarize(undefined)).toEqual({
      bundleId: '',
      bundleType: '',
      resourceIds: '',
      resourcesCreated: '[]',
    })
  })

  // Pins today's behaviour, carried over unchanged from `createResource`: a
  // location that does not parse drops the entry from `resourceIds` but not
  // from `resourcesCreated`, which falls back to the resource.
  test('Should treat an unparsable location differently in the two lists', () => {
    const result = summarize([
      { response: { status: '200 OK', location: 'unparsable' }, resource: { resourceType: 'Task', id: 't1' } as never },
    ])

    expect(result.resourceIds).toBe('')
    expect(JSON.parse(result.resourcesCreated)).toEqual([
      { id: 't1', resourceType: 'Task', status: '200 OK', location: 'Task/t1' },
    ])
  })
})

describe('Medplum - summarizeBundleResult', () => {
  test('Should return the id and type of the result and nothing about its entries', () => {
    const result = {
      resourceType: 'Bundle',
      id: 'bundle-1',
      type: 'transaction-response',
      entry: [{ response: { status: '201 Created', location: 'Patient/p1/_history/1' } }],
    } as Bundle

    expect(summarizeBundleResult(result)).toEqual({
      bundleId: 'bundle-1',
      bundleType: 'transaction-response',
    })
  })

  test('Should give empty strings for a result with neither', () => {
    expect(summarizeBundleResult({ resourceType: 'Bundle' } as Bundle)).toEqual({
      bundleId: '',
      bundleType: '',
    })
  })
})
