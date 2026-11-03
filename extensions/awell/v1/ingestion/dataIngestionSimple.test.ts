import { TestHelpers } from '@awell-health/extensions-core'
import { Awell } from '../..'
import {
  dataIngestionSimple,
  dataIngestionSimpleSchema,
} from './dataIngestionSimple'

describe('Awell - Ingestion - Data ingestion, simple', () => {
  const { store, events, helpers, clearMocks } =
    TestHelpers.fromIngestion(dataIngestionSimple)

  beforeEach(() => {
    clearMocks()
  })

  test('is registered on the extension under its own key', () => {
    expect(Awell.ingestion).toContain(dataIngestionSimple)
    expect(dataIngestionSimple.key).toBe('dataIngestionSimple')
  })

  test('writes the payload to the patient as-is and publishes the start and test events', async () => {
    await dataIngestionSimple.run({
      record: dataIngestionSimpleSchema.parse({
        patient_id: 'P-1001',
        facility_name: 'North',
        Gender: 'female',
        first_name: 'Jane',
      }),
      store,
      events,
      settings: {},
      helpers,
      attempt: 1,
    })

    expect(store.save.mock.calls).toEqual([
      [
        'patient',
        { facility_name: 'North', Gender: 'female', first_name: 'Jane' },
      ],
    ])
    expect(events.publish.mock.calls.map(([event]) => event.key)).toEqual([
      'careflow.start',
      'ingestion.testing',
    ])
  })
})
