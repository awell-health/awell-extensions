import {
  type Condition,
  type Location,
  type Practitioner,
} from '@medplum/fhirtypes'
import { conditionFrom, locationFrom, practitionerFrom } from './resources'

describe('Metriport - Ingestion - ADT resource mapping', () => {
  describe('locationFrom', () => {
    const location: Location = {
      resourceType: 'Location',
      id: '3ca5e8d2-7c84-45ab-91e7-834f8becde12',
      status: 'active',
      name: 'Memorial Hospital',
      mode: 'instance',
      type: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode',
              code: 'HOSP',
              display: 'Hospital',
            },
          ],
        },
      ],
    }

    test('keeps the name, status and type code', () => {
      expect(locationFrom(location)).toEqual({
        metriportId: '3ca5e8d2-7c84-45ab-91e7-834f8becde12',
        name: 'Memorial Hospital',
        status: 'active',
        type: 'HOSP',
      })
    })

    test('omits what the resource does not carry rather than writing undefined', () => {
      expect(locationFrom({ resourceType: 'Location', id: 'loc-1' })).toEqual({
        metriportId: 'loc-1',
      })
    })

    test('has nothing to key on without an id', () => {
      expect(locationFrom({ resourceType: 'Location' })).toBeUndefined()
    })
  })

  describe('practitionerFrom', () => {
    const practitioner: Practitioner = {
      resourceType: 'Practitioner',
      id: '49e3c8f1-d67a-47b8-b9a2-cf23e8d0e941',
      name: [
        {
          use: 'official',
          family: 'Rodriguez',
          given: ['Maria'],
          prefix: ['Dr.'],
        },
      ],
      qualification: [
        {
          code: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0360',
                code: 'MD',
                display: 'Doctor of Medicine',
              },
            ],
          },
        },
      ],
    }

    test('assembles a display name beside the parts it was built from', () => {
      expect(practitionerFrom(practitioner)).toEqual({
        metriportId: '49e3c8f1-d67a-47b8-b9a2-cf23e8d0e941',
        name: 'Dr. Maria Rodriguez',
        prefix: 'Dr.',
        given: 'Maria',
        family: 'Rodriguez',
        qualifications: ['MD'],
      })
    })

    test('joins the repeats FHIR allows on a single name', () => {
      expect(
        practitionerFrom({
          resourceType: 'Practitioner',
          id: 'p-1',
          name: [{ given: ['Mary', 'Jane'], family: 'Vale', prefix: ['Dr.'] }],
        }),
      ).toMatchObject({ name: 'Dr. Mary Jane Vale', given: 'Mary Jane' })
    })

    test('omits the name entirely when the resource carries none', () => {
      expect(
        practitionerFrom({ resourceType: 'Practitioner', id: 'p-1' }),
      ).toEqual({ metriportId: 'p-1' })
    })
  })

  describe('conditionFrom', () => {
    const condition: Condition = {
      resourceType: 'Condition',
      id: '8724f6e9-c531-48ba-9d34-7e2a81c05fb3',
      clinicalStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'active',
            display: 'Active',
          },
        ],
      },
      verificationStatus: {
        coding: [
          {
            system:
              'http://terminology.hl7.org/CodeSystem/condition-ver-status',
            code: 'confirmed',
            display: 'Confirmed',
          },
        ],
      },
      category: [
        {
          coding: [
            {
              system:
                'http://terminology.hl7.org/CodeSystem/condition-category',
              code: 'encounter-diagnosis',
              display: 'Encounter Diagnosis',
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '194828000',
            display: 'Stable angina',
          },
        ],
        text: 'Stable Angina',
      },
      subject: { reference: 'Patient/78a4d9e5-f2b3-42c8-9a84-52f3e21c2b9d' },
      onsetDateTime: '2024-03-15T14:20:00.000Z',
      recordedDate: '2024-03-15T16:45:00.000Z',
    }

    test('keeps every coding, since the code system varies, but only the code of the fixed value sets', () => {
      expect(conditionFrom(condition)).toEqual({
        metriportId: '8724f6e9-c531-48ba-9d34-7e2a81c05fb3',
        text: 'Stable Angina',
        codes: [
          {
            system: 'http://snomed.info/sct',
            code: '194828000',
            display: 'Stable angina',
          },
        ],
        clinicalStatus: 'active',
        verificationStatus: 'confirmed',
        category: 'encounter-diagnosis',
        onsetAt: '2024-03-15T14:20:00.000Z',
        recordedAt: '2024-03-15T16:45:00.000Z',
      })
    })

    test('keeps a second coding of the same condition rather than only the first', () => {
      expect(
        conditionFrom({
          ...condition,
          code: {
            coding: [
              { system: 'http://snomed.info/sct', code: '194828000' },
              {
                system: 'http://hl7.org/fhir/sid/icd-10-cm',
                code: 'I20.9',
                display: 'Angina pectoris, unspecified',
              },
            ],
          },
        }),
      ).toMatchObject({
        codes: [
          { system: 'http://snomed.info/sct', code: '194828000' },
          {
            system: 'http://hl7.org/fhir/sid/icd-10-cm',
            code: 'I20.9',
            display: 'Angina pectoris, unspecified',
          },
        ],
      })
    })

    test('falls back to the first coding display when the code carries no text', () => {
      expect(
        conditionFrom({
          ...condition,
          code: { coding: [{ code: '194828000', display: 'Stable angina' }] },
        }),
      ).toMatchObject({ text: 'Stable angina' })
    })

    test('omits an onset that is a period rather than a date, which this shape cannot hold', () => {
      const { onsetDateTime, ...withoutOnset } = condition

      expect(
        conditionFrom({
          ...withoutOnset,
          onsetPeriod: { start: '2024-03-15T14:20:00.000Z' },
        }),
      ).not.toHaveProperty('onsetAt')
    })
  })
})
