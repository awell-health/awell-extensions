import { TestHelpers } from '@awell-health/extensions-core'
import { Awell } from '../..'
import admission from './__testdata__/demo/01-admission.json'
import followUpDiagnosis from './__testdata__/demo/02-follow-up-diagnosis.json'
import discharge from './__testdata__/demo/03-discharge.json'
import {
  IDENTIFIER_SYSTEM,
  CONDITION_OBJECT,
  ENCOUNTER_OBJECT,
  LOCATION_OBJECT,
  ORGANIZATION_OBJECT,
} from './catalog'
import { dataIngestion, dataIngestionSchema } from './dataIngestion'

describe('Awell - Ingestion - Data ingestion', () => {
  const { store, events, helpers, clearMocks } =
    TestHelpers.fromIngestion(dataIngestion)

  beforeEach(() => {
    clearMocks()
  })

  const run = async (payload: unknown): Promise<void> => {
    await dataIngestion.run({
      record: dataIngestionSchema.parse(payload),
      store,
      events,
      settings: {},
      helpers,
      attempt: 1,
    })
  }

  const savesOf = (object: string): Array<Record<string, unknown>> =>
    store.save.mock.calls
      .filter(([name]) => name === object)
      .map(([, data]) => data)

  const published = (): string[] =>
    events.publish.mock.calls.map(([event]) => event.key)

  test('is registered on the extension', () => {
    expect(Awell.ingestion).toContain(dataIngestion)
  })

  test("resolves the patient by patient_id under the sender's system of record", () => {
    expect(dataIngestion.identifier.system).toBe(IDENTIFIER_SYSTEM)
    expect(
      dataIngestion.identifier.resolveValue(
        dataIngestionSchema.parse(admission),
      ),
    ).toBe('P-1001')
  })

  describe('an admission with a facility and a diagnosis', () => {
    beforeEach(async () => {
      await run(admission)
    })

    test('saves the patient first, then the encounter, then the condition', () => {
      expect(store.save.mock.calls.map(([name]) => name)).toEqual([
        'patient',
        ENCOUNTER_OBJECT,
        CONDITION_OBJECT,
      ])
    })

    test('writes demographics under the profile catalog keys', () => {
      expect(savesOf('patient')).toEqual([
        {
          first_name: 'Jane',
          last_name: 'Doe',
          birth_date: '1980-04-12',
          sex: 2,
          email: 'jane.doe@example.com',
          address: {
            street: '1 Main Street',
            city: 'Boston',
            state: 'MA',
            zip: '02110',
            country: 'US',
          },
        },
      ])
    })

    test('upserts the encounter on the visit id, pointing at the Location and Organization by identifier', () => {
      expect(savesOf(ENCOUNTER_OBJECT)).toEqual([
        {
          identifier: { system: IDENTIFIER_SYSTEM, value: 'V-2001' },
          class: {
            system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
            code: 'IMP',
            display: 'inpatient encounter',
          },
          status: {
            system: 'http://hl7.org/fhir/encounter-status',
            code: 'in-progress',
          },
          period_start: '2026-11-01T08:30:00Z',
          location: [
            {
              $ref: {
                object: LOCATION_OBJECT,
                identifier: {
                  system: IDENTIFIER_SYSTEM,
                  value: 'FAC-NORTH',
                },
              },
            },
          ],
          service_provider: {
            $ref: {
              object: ORGANIZATION_OBJECT,
              identifier: {
                system: IDENTIFIER_SYSTEM,
                value: 'ORG-ACME',
              },
            },
          },
        },
      ])
    })

    test('upserts the condition on its id, linked to the encounter by the id its save answered', () => {
      const [encounter] = store.save.mock.results
        .filter((_, i) => store.save.mock.calls[i][0] === ENCOUNTER_OBJECT)
        .map(({ value }) => value as { id: string })

      expect(savesOf(CONDITION_OBJECT)).toEqual([
        {
          identifier: { system: IDENTIFIER_SYSTEM, value: 'C-3001' },
          code: {
            system: 'http://hl7.org/fhir/sid/icd-10-cm',
            code: 'I21.4',
            display: 'Non-ST elevation myocardial infarction',
          },
          clinical_status: {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'active',
          },
          verification_status: {
            system:
              'http://terminology.hl7.org/CodeSystem/condition-ver-status',
            code: 'confirmed',
          },
          category: [
            {
              system:
                'http://terminology.hl7.org/CodeSystem/condition-category',
              code: 'encounter-diagnosis',
              display: 'Encounter Diagnosis',
            },
          ],
          severity: {
            system: 'http://snomed.info/sct',
            code: '24484000',
            display: 'Severe',
          },
          encounter: encounter.id,
          onset_at: '2026-11-01T06:00:00Z',
          recorded_at: '2026-11-01T09:15:00Z',
        },
      ])
    })

    test('publishes the start, test and admitted events', () => {
      expect(published()).toEqual([
        'careflow.start',
        'ingestion.testing',
        'patient.admitted',
      ])
    })
  })

  test('a discharge finishes the encounter and says so', async () => {
    await run({
      patient_id: 'P-1001',
      encounter: {
        visit_id: 'V-2001',
        class: 'inpatient',
        discharged_at: '2026-11-04T15:00:00Z',
        discharge_disposition: 'home',
      },
    })

    expect(savesOf(ENCOUNTER_OBJECT)).toEqual([
      expect.objectContaining({
        status: {
          system: 'http://hl7.org/fhir/encounter-status',
          code: 'finished',
        },
        period_end: '2026-11-04T15:00:00Z',
        discharge_disposition: {
          system: 'http://terminology.hl7.org/CodeSystem/discharge-disposition',
          code: 'home',
        },
      }),
    ])
    expect(savesOf(ENCOUNTER_OBJECT)[0]).not.toHaveProperty('location')
    expect(published()).toContain('patient.discharged')
    expect(published()).not.toContain('patient.admitted')
  })

  test('a condition naming an earlier visit points at that encounter by identifier', async () => {
    await run({
      patient_id: 'P-1001',
      condition: {
        condition_id: 'C-3002',
        visit_id: 'V-2001',
        icd10_code: 'E11.9',
      },
    })

    expect(store.save.mock.calls.map(([name]) => name)).toEqual([
      CONDITION_OBJECT,
    ])
    expect(savesOf(CONDITION_OBJECT)[0]).toMatchObject({
      encounter: {
        $ref: {
          object: ENCOUNTER_OBJECT,
          identifier: { system: IDENTIFIER_SYSTEM, value: 'V-2001' },
        },
      },
      category: [expect.objectContaining({ code: 'encounter-diagnosis' })],
    })
    expect(published()).toEqual(['careflow.start', 'ingestion.testing'])
  })

  test("a condition naming the payload's own visit uses the encounter just saved", async () => {
    await run({
      ...admission,
      condition: { ...admission.condition, visit_id: 'V-2001' },
    })

    expect(savesOf(CONDITION_OBJECT)[0].encounter).toBe(`${ENCOUNTER_OBJECT}-1`)
  })

  test('a condition with no visit and no encounter is saved without one', async () => {
    await run({
      patient_id: 'P-1001',
      condition: { condition_id: 'C-3003', icd10_code: 'J45.909' },
    })

    const [condition] = savesOf(CONDITION_OBJECT)
    expect(condition).not.toHaveProperty('encounter')
    expect(condition).not.toHaveProperty('category')
  })

  test('a payload with only the subject key saves nothing but still publishes', async () => {
    await run({ patient_id: 'P-1001' })

    expect(store.save).not.toHaveBeenCalled()
    expect(published()).toEqual(['careflow.start', 'ingestion.testing'])
  })

  test('saves the preferred language on the patient, so the runtime sends messages in it', async () => {
    await run({ patient_id: 'P-1001', preferred_language: 'es' })

    expect(savesOf('patient')).toEqual([{ preferred_language: 'es' }])
  })

  test('lower-cases the preferred language', async () => {
    await run({ patient_id: 'P-1001', preferred_language: ' ES ' })

    expect(savesOf('patient')).toEqual([{ preferred_language: 'es' }])
  })

  describe('demo payloads', () => {
    test('the follow-up diagnosis links to the admitted visit by identifier', async () => {
      await run(followUpDiagnosis)

      expect(savesOf(CONDITION_OBJECT)).toEqual([
        expect.objectContaining({
          identifier: { system: IDENTIFIER_SYSTEM, value: 'C-3002' },
          encounter: {
            $ref: {
              object: ENCOUNTER_OBJECT,
              identifier: {
                system: IDENTIFIER_SYSTEM,
                value: 'V-2001',
              },
            },
          },
        }),
      ])
    })

    test('the discharge upserts the admitted encounter and condition by their identifiers', async () => {
      await run(discharge)

      expect(savesOf(ENCOUNTER_OBJECT)).toEqual([
        expect.objectContaining({
          identifier: { system: IDENTIFIER_SYSTEM, value: 'V-2001' },
          status: expect.objectContaining({ code: 'finished' }),
        }),
      ])
      expect(savesOf(CONDITION_OBJECT)).toEqual([
        expect.objectContaining({
          identifier: { system: IDENTIFIER_SYSTEM, value: 'C-3001' },
          clinical_status: expect.objectContaining({ code: 'resolved' }),
          encounter: `${ENCOUNTER_OBJECT}-1`,
        }),
      ])
      expect(published()).toContain('patient.discharged')
    })
  })

  describe('schema', () => {
    test.each([
      [
        'an unknown encounter class',
        { encounter: { visit_id: 'V', class: 'spaceship' } },
      ],
      [
        'a timestamp without an offset',
        {
          encounter: {
            visit_id: 'V',
            class: 'inpatient',
            admitted_at: '2026-11-01 08:30',
          },
        },
      ],
      ['a condition without a code', { condition: { condition_id: 'C' } }],
      ['an unknown sex', { sex: 'F' }],
      ['a regional language tag', { preferred_language: 'es-ES' }],
      ['a three-letter language code', { preferred_language: 'spa' }],
      ['an empty language', { preferred_language: '' }],
    ])('refuses %s', (_, payload) => {
      expect(
        dataIngestionSchema.safeParse({ patient_id: 'P-1001', ...payload })
          .success,
      ).toBe(false)
    })
  })
})
