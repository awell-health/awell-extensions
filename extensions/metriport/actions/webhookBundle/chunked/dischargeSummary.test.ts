import { TestHelpers, type ObjectStore } from '@awell-health/extensions-core'
import { extractDischargeSummary } from '../dischargeSummary/extract'
import { ccdDischargeSummaryBundle } from '../dischargeSummary/__testdata__/ccdDischargeSummaryBundle'
import { progressNoteDischargeSummaryBundle } from '../dischargeSummary/__testdata__/progressNoteDischargeSummaryBundle'
import { dischargeSummaryBundle } from '../../../ingestion/adt/__testdata__/dischargeSummaryBundle'
import { patientAdmitBundle } from '../bundle/__testdata__/patientAdmitBundle'
import { readDischargeSummary } from './dischargeSummary'

// The real extractor, kept as a spy so a test can see what it was handed.
jest.mock('../dischargeSummary/extract', () => {
  const actual = jest.requireActual('../dischargeSummary/extract')
  return {
    ...actual,
    extractDischargeSummary: jest.fn(actual.extractDischargeSummary),
  }
})
const extractor = extractDischargeSummary as jest.MockedFunction<typeof extractDischargeSummary>

const newStore = (): ObjectStore => TestHelpers.mockHelpers().objectStore

describe('Metriport - readDischargeSummary', () => {
  beforeEach(() => {
    extractor.mockClear()
  })

  test.each([
    ['a progress note', progressNoteDischargeSummaryBundle],
    ['a CCD', ccdDischargeSummaryBundle],
  ])(
    'Should lift exactly what the extractor lifts from the whole of %s',
    async (_name, bundle) => {
      const store = newStore()
      const ref = await store.put('a.json', JSON.stringify(bundle))

      const streamed = await readDischargeSummary(store, ref)

      expect(streamed).toEqual(extractDischargeSummary(bundle as never))
      expect(streamed).toBeDefined()
    },
  )

  test.each([
    ['an encounter bundle', patientAdmitBundle],
    ['the ingestion discharge summary, which has none', dischargeSummaryBundle],
  ])('Should yield nothing for %s, as the extractor does', async (_name, bundle) => {
    const store = newStore()
    const ref = await store.put('a.json', JSON.stringify(bundle))

    expect(extractDischargeSummary(bundle as never)).toBeUndefined()
    expect(await readDischargeSummary(store, ref)).toBeUndefined()
  })

  test('Should read only the reports the document points at, not every report in it', async () => {
    const bundle = JSON.parse(JSON.stringify(progressNoteDischargeSummaryBundle))
    // A thousand reports that nothing refers to, each with a note that would be
    // costly to hold. They must not change the result, nor be collected.
    const noise = Array.from({ length: 1000 }, (_, i) => ({
      fullUrl: `urn:uuid:noise-${i}`,
      resource: {
        resourceType: 'DiagnosticReport',
        id: `noise-${i}`,
        status: 'final',
        code: { text: 'Noise' },
        presentedForm: [{ contentType: 'text/plain', data: Buffer.from('x'.repeat(1000)).toString('base64') }],
      },
    }))
    bundle.entry.push(...noise)
    const store = newStore()
    const ref = await store.put('a.json', JSON.stringify(bundle))

    const streamed = await readDischargeSummary(store, ref)

    const handed = extractor.mock.calls[0][0].entry ?? []
    expect(streamed).toEqual(extractDischargeSummary(progressNoteDischargeSummaryBundle as never))
    expect(handed.filter((entry) => entry.resource?.id?.startsWith('noise-'))).toEqual([])
    // Not the document reduced to nothing: the reports it does point at were read.
    expect(handed.some((entry) => entry.resource?.resourceType === 'DiagnosticReport')).toBe(true)
  })
})
