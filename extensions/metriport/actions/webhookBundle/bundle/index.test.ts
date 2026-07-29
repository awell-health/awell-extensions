import { type Bundle } from '@medplum/fhirtypes'
import { buildTransactionBundle } from './index'
import {
  ACCOUNT_ORGANIZATION_FULL_URL,
  METRIPORT_ACCOUNT_ORGANIZATION_NAME,
} from './constants'
import {
  METRIPORT_CONDITION_ID,
  METRIPORT_ENCOUNTER_ID,
  METRIPORT_LOCATION_ID,
  METRIPORT_PATIENT_ID,
  METRIPORT_PRACTITIONER_ID,
  patientAdmitBundle,
} from './__testdata__/patientAdmitBundle'

const build = (
  overrides: Parameters<typeof buildTransactionBundle>[0] extends never
    ? never
    : Partial<Parameters<typeof buildTransactionBundle>[0]>,
) =>
  buildTransactionBundle({
    bundle: patientAdmitBundle,
    awellPatientId: 'awell-patient-1',
    now: '2026-07-29T00:00:00.000Z',
    ...overrides,
  })

const entryFor = (bundle: Bundle, resourceType: string) =>
  bundle.entry?.find((entry) => entry.resource?.resourceType === resourceType)

describe('buildTransactionBundle — guards', () => {
  test('returns undefined for a bundle that is not a collection', () => {
    const result = build({
      bundle: { ...patientAdmitBundle, type: 'searchset' },
    })

    expect(result).toBeUndefined()
  })

  test('throws when the collection bundle has no Patient entry', () => {
    const withoutPatient: Bundle = {
      ...patientAdmitBundle,
      entry: patientAdmitBundle.entry?.filter(
        (entry) => entry.resource?.resourceType !== 'Patient',
      ),
    }

    expect(() => build({ bundle: withoutPatient })).toThrow(
      /has no Patient entry/,
    )
  })

  test('throws when the collection bundle has no Encounter entry', () => {
    const withoutEncounter: Bundle = {
      ...patientAdmitBundle,
      entry: patientAdmitBundle.entry?.filter(
        (entry) => entry.resource?.resourceType !== 'Encounter',
      ),
    }

    expect(() => build({ bundle: withoutEncounter })).toThrow(
      /has no Encounter entry/,
    )
  })

  test('names both resources when the collection bundle is empty', () => {
    expect(() =>
      build({ bundle: { ...patientAdmitBundle, entry: [] } }),
    ).toThrow(/has no Patient or Encounter entry/)
  })

  test('finds the Patient and Encounter by resourceType, not by position', () => {
    const reordered: Bundle = {
      ...patientAdmitBundle,
      entry: [...(patientAdmitBundle.entry ?? [])].reverse(),
    }

    expect(build({ bundle: reordered })).toBeDefined()
  })
})

describe('buildTransactionBundle — shape', () => {
  test('produces a transaction bundle', () => {
    expect(build({})?.type).toBe('transaction')
  })

  test('does not mutate the input bundle', () => {
    const snapshot = JSON.stringify(patientAdmitBundle)

    build({})

    expect(JSON.stringify(patientAdmitBundle)).toBe(snapshot)
  })

  test('carries no meta on any entry', () => {
    const result = build({})

    for (const entry of result?.entry ?? []) {
      expect(entry.resource?.meta).toBeUndefined()
    }
  })

  test('strips the Metriport meta the Encounter arrives with', () => {
    const encounter = entryFor(build({}) as Bundle, 'Encounter')

    expect(encounter?.resource?.meta).toBeUndefined()
  })

  test('includes no Patient entry', () => {
    expect(entryFor(build({}) as Bundle, 'Patient')).toBeUndefined()
  })

  test('includes the account Organization with ifNoneExist', () => {
    const organization = entryFor(build({}) as Bundle, 'Organization')

    expect(organization?.request).toEqual({
      method: 'POST',
      url: 'Organization',
      ifNoneExist: `name:exact=${METRIPORT_ACCOUNT_ORGANIZATION_NAME}`,
    })
  })

  test('writes each Metriport resource with a conditional update', () => {
    const result = build({}) as Bundle

    expect(entryFor(result, 'Encounter')?.request).toEqual({
      method: 'PUT',
      url: `Encounter?identifier=https://metriport.com/fhir/encounter|${METRIPORT_ENCOUNTER_ID}`,
    })
    expect(entryFor(result, 'Location')?.request).toEqual({
      method: 'PUT',
      url: `Location?identifier=https://metriport.com/fhir/location|${METRIPORT_LOCATION_ID}`,
    })
    expect(entryFor(result, 'Practitioner')?.request).toEqual({
      method: 'PUT',
      url: `Practitioner?identifier=https://metriport.com/fhir/practitioner|${METRIPORT_PRACTITIONER_ID}`,
    })
    expect(entryFor(result, 'Condition')?.request).toEqual({
      method: 'PUT',
      url: `Condition?identifier=https://metriport.com/fhir/condition|${METRIPORT_CONDITION_ID}`,
    })
  })

  test('preserves the Encounter visit-number identifier alongside ours', () => {
    const encounter = entryFor(build({}) as Bundle, 'Encounter')

    expect((encounter?.resource as any).identifier).toEqual([
      expect.objectContaining({ value: '987654321' }),
      {
        system: 'https://metriport.com/fhir/encounter',
        value: METRIPORT_ENCOUNTER_ID,
      },
    ])
  })
})

describe('buildTransactionBundle — references', () => {
  test('rewrites Patient references to a conditional reference', () => {
    const result = build({}) as Bundle

    expect(
      (entryFor(result, 'Encounter')?.resource as any).subject.reference,
    ).toBe(
      'Patient?identifier=https://awellhealth.com/patients|awell-patient-1',
    )
    expect(
      (entryFor(result, 'Condition')?.resource as any).subject.reference,
    ).toBe(
      'Patient?identifier=https://awellhealth.com/patients|awell-patient-1',
    )
  })

  test('rewrites Encounter-to-Location and Encounter-to-Practitioner references', () => {
    const encounter = entryFor(build({}) as Bundle, 'Encounter')
      ?.resource as any

    expect(encounter.location[0].location.reference).toBe(
      `urn:uuid:${METRIPORT_LOCATION_ID}`,
    )
    expect(encounter.participant[0].individual.reference).toBe(
      `urn:uuid:${METRIPORT_PRACTITIONER_ID}`,
    )
  })

  test('rewrites references in both directions between Encounter and Condition', () => {
    const result = build({}) as Bundle
    const encounter = entryFor(result, 'Encounter')?.resource as any
    const condition = entryFor(result, 'Condition')?.resource as any

    expect(encounter.diagnosis[0].condition.reference).toBe(
      `urn:uuid:${METRIPORT_CONDITION_ID}`,
    )
    expect(condition.encounter.reference).toBe(
      `urn:uuid:${METRIPORT_ENCOUNTER_ID}`,
    )
  })

  test('keeps the fullUrl and strips the id on every Metriport entry', () => {
    const encounter = entryFor(build({}) as Bundle, 'Encounter')

    expect(encounter?.fullUrl).toBe(`urn:uuid:${METRIPORT_ENCOUNTER_ID}`)
    expect(encounter?.resource?.id).toBeUndefined()
  })

  test('leaves coding systems and display text alone', () => {
    const encounter = entryFor(build({}) as Bundle, 'Encounter')
      ?.resource as any

    expect(encounter.class.system).toBe(
      'http://terminology.hl7.org/CodeSystem/v3-ActCode',
    )
    expect(encounter.subject.display).toBe('Sarah Johnson')
  })
})

describe('buildTransactionBundle — provenance', () => {
  const provenanceOf = (bundle: Bundle) =>
    entryFor(bundle, 'Provenance')?.resource as any

  test('targets every created resource but not the Patient', () => {
    const provenance = provenanceOf(build({}) as Bundle)

    expect(provenance.target).toEqual([
      { reference: `urn:uuid:${METRIPORT_ENCOUNTER_ID}` },
      { reference: `urn:uuid:${METRIPORT_LOCATION_ID}` },
      { reference: `urn:uuid:${METRIPORT_PRACTITIONER_ID}` },
      { reference: `urn:uuid:${METRIPORT_CONDITION_ID}` },
    ])
    expect(JSON.stringify(provenance.target)).not.toContain(
      METRIPORT_PATIENT_ID,
    )
  })

  test('records the bundle timestamp', () => {
    expect(provenanceOf(build({}) as Bundle).recorded).toBe(
      '2025-03-15T16:45:10.000+00:00',
    )
  })

  test('falls back to the injected now when the bundle has no timestamp', () => {
    const result = build({
      bundle: { ...patientAdmitBundle, timestamp: undefined },
    }) as Bundle

    expect(provenanceOf(result).recorded).toBe('2026-07-29T00:00:00.000Z')
  })

  test('references the account Organization as its agent', () => {
    expect(provenanceOf(build({}) as Bundle).agent[0].who.reference).toBe(
      ACCOUNT_ORGANIZATION_FULL_URL,
    )
  })

  test('records the source bundle id', () => {
    expect(provenanceOf(build({}) as Bundle).entity[0].what.identifier).toEqual(
      {
        system: 'https://metriport.com/fhir/bundle',
        value: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      },
    )
  })

  test('includes the configured reason', () => {
    const result = build({ reason: 'Inpatient admission' }) as Bundle

    expect(provenanceOf(result).reason).toEqual([
      { text: 'Inpatient admission' },
    ])
  })

  test('derives the activity from the event type', () => {
    const result = build({ eventType: 'patient.admit' }) as Bundle

    expect(provenanceOf(result).activity.coding[0].code).toBe('A01')
  })

  test('omits the activity when no event type is given', () => {
    expect(provenanceOf(build({}) as Bundle).activity).toBeUndefined()
  })

  test('is the last entry, after everything it targets', () => {
    const result = build({}) as Bundle

    expect(result.entry?.[result.entry.length - 1].resource?.resourceType).toBe(
      'Provenance',
    )
  })
})
