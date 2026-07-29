import { buildReferenceMap, rewriteReferences } from './references'
import {
  METRIPORT_CONDITION_ID,
  METRIPORT_ENCOUNTER_ID,
  METRIPORT_PATIENT_ID,
  patientAdmitBundle,
} from './__testdata__/patientAdmitBundle'

describe('buildReferenceMap', () => {
  test('maps the Patient to a conditional reference on the Awell identifier', () => {
    const map = buildReferenceMap(patientAdmitBundle, 'awell-patient-1')

    expect(map[`Patient/${METRIPORT_PATIENT_ID}`]).toBe(
      'Patient?identifier=https://awellhealth.com/patients|awell-patient-1',
    )
  })

  test("maps every non-Patient resource to the entry's own fullUrl", () => {
    const map = buildReferenceMap(patientAdmitBundle, 'awell-patient-1')

    expect(map[`Encounter/${METRIPORT_ENCOUNTER_ID}`]).toBe(
      `urn:uuid:${METRIPORT_ENCOUNTER_ID}`,
    )
    expect(map[`Condition/${METRIPORT_CONDITION_ID}`]).toBe(
      `urn:uuid:${METRIPORT_CONDITION_ID}`,
    )
  })

  test("honours a fullUrl that is not the urn form of the resource's id", () => {
    const map = buildReferenceMap(
      {
        resourceType: 'Bundle',
        type: 'collection',
        entry: [
          {
            fullUrl: 'https://api.metriport.com/fhir/Location/abc',
            resource: { resourceType: 'Location', id: 'abc' },
          },
        ],
      },
      'awell-patient-1',
    )

    expect(map['Location/abc']).toBe(
      'https://api.metriport.com/fhir/Location/abc',
    )
  })

  test('falls back to the urn form when an entry carries no fullUrl', () => {
    const map = buildReferenceMap(
      {
        resourceType: 'Bundle',
        type: 'collection',
        entry: [{ resource: { resourceType: 'Location', id: 'abc' } }],
      },
      'awell-patient-1',
    )

    expect(map['Location/abc']).toBe('urn:uuid:abc')
  })
})

describe('rewriteReferences', () => {
  const map = {
    'Patient/metriport-patient': 'Patient?identifier=system|awell-1',
    'Encounter/metriport-encounter': 'urn:uuid:metriport-encounter',
  }

  test('rewrites a nested reference', () => {
    const result = rewriteReferences(
      { subject: { reference: 'Patient/metriport-patient' } },
      map,
    )

    expect(result).toEqual({
      subject: { reference: 'Patient?identifier=system|awell-1' },
    })
  })

  test('rewrites references inside arrays', () => {
    const result = rewriteReferences(
      {
        diagnosis: [
          { condition: { reference: 'Encounter/metriport-encounter' } },
        ],
      },
      map,
    )

    expect(result).toEqual({
      diagnosis: [{ condition: { reference: 'urn:uuid:metriport-encounter' } }],
    })
  })

  test('leaves references absent from the map untouched', () => {
    const result = rewriteReferences(
      { subject: { reference: 'Organization/some-other-org' } },
      map,
    )

    expect(result).toEqual({
      subject: { reference: 'Organization/some-other-org' },
    })
  })

  test('leaves absolute URLs untouched', () => {
    const result = rewriteReferences(
      { subject: { reference: 'https://example.com/fhir/Patient/123' } },
      map,
    )

    expect(result).toEqual({
      subject: { reference: 'https://example.com/fhir/Patient/123' },
    })
  })

  test('does not mutate its input', () => {
    const input = { subject: { reference: 'Patient/metriport-patient' } }

    rewriteReferences(input, map)

    expect(input.subject.reference).toBe('Patient/metriport-patient')
  })

  test('leaves non-reference string fields untouched', () => {
    const result = rewriteReferences(
      { display: 'Patient/metriport-patient', code: 'AMB' },
      map,
    )

    expect(result).toEqual({
      display: 'Patient/metriport-patient',
      code: 'AMB',
    })
  })
})
