import { type Bundle } from '@medplum/fhirtypes'

/**
 * A real `patient.admit` Patient Encounter Bundle from Metriport's demo data.
 *
 * Deliberately kept verbatim, including the quirks the transformation has to
 * cope with:
 * - `type: 'collection'`, so no entry carries `request` metadata
 * - internal references use Metriport's own UUIDs (`Patient/78a4d9e5-…`)
 *   rather than the `urn:uuid:` form the `fullUrl`s use
 * - the Encounter arrives with a `meta` (`api.metriport.com/created-at`
 *   extension and a `versionId`) that must be stripped
 * - references point in both directions: Encounter → Condition via
 *   `diagnosis`, and Condition → Encounter via `encounter`
 *
 * https://docs.metriport.com/medical-api/handling-data/patient-encounter-bundle
 */
export const patientAdmitBundle: Bundle = {
  resourceType: 'Bundle',
  id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
  type: 'collection',
  timestamp: '2025-03-15T16:45:10.000+00:00',
  entry: [
    {
      fullUrl: 'urn:uuid:78a4d9e5-f2b3-42c8-9a84-52f3e21c2b9d',
      resource: {
        resourceType: 'Patient',
        id: '78a4d9e5-f2b3-42c8-9a84-52f3e21c2b9d',
        name: [
          {
            use: 'official',
            family: 'Johnson',
            given: ['Sarah'],
          },
        ],
        gender: 'female',
        birthDate: '1975-06-15',
      },
    },
    {
      fullUrl: 'urn:uuid:c60544e1-2e37-45fb-8160-3d583902cfde',
      resource: {
        resourceType: 'Encounter',
        id: 'c60544e1-2e37-45fb-8160-3d583902cfde',
        meta: {
          extension: [
            {
              url: 'https://api.metriport.com/created-at',
              valueInstant: '2025-03-15T16:45:10.000+00:00',
            },
          ],
          versionId: '0.1.0',
        },
        status: 'in-progress',
        period: { start: '2024-07-22T19:50:00.000Z' },
        class: {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: 'AMB',
          display: 'Ambulatory',
        },
        serviceType: {
          coding: [
            {
              code: '394592004',
              display: 'Cardiology',
            },
          ],
          text: 'Cardiology',
        },
        subject: {
          reference: 'Patient/78a4d9e5-f2b3-42c8-9a84-52f3e21c2b9d',
          type: 'Patient',
          display: 'Sarah Johnson',
        },
        location: [
          {
            location: {
              reference: 'Location/3ca5e8d2-7c84-45ab-91e7-834f8becde12',
              type: 'Location',
              display: 'Memorial Hospital',
            },
          },
        ],
        participant: [
          {
            type: [
              {
                coding: [
                  {
                    system:
                      'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                    code: 'ATND',
                    display: 'attender',
                  },
                ],
              },
            ],
            individual: {
              reference: 'Practitioner/49e3c8f1-d67a-47b8-b9a2-cf23e8d0e941',
              type: 'Practitioner',
              display: 'Dr. Maria Rodriguez',
            },
            period: {
              start: '2024-03-15T14:20:00.000Z',
            },
          },
        ],
        reasonCode: [
          {
            text: 'Chest pain',
          },
        ],
        diagnosis: [
          {
            condition: {
              reference: 'Condition/8724f6e9-c531-48ba-9d34-7e2a81c05fb3',
              type: 'Condition',
              display: 'Stable Angina',
            },
            use: {
              coding: [
                {
                  system:
                    'https://terminology.hl7.org/5.2.0/CodeSystem-v2-0052.html',
                  code: 'AD',
                  display: 'Final diagnosis',
                },
              ],
            },
            rank: 1,
          },
        ],
        identifier: [
          {
            type: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                  code: 'VN',
                  display: 'visit number',
                },
              ],
              text: 'visit number',
            },
            value: '987654321',
          },
        ],
      },
    },
    {
      fullUrl: 'urn:uuid:3ca5e8d2-7c84-45ab-91e7-834f8becde12',
      resource: {
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
      },
    },
    {
      fullUrl: 'urn:uuid:49e3c8f1-d67a-47b8-b9a2-cf23e8d0e941',
      resource: {
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
      },
    },
    {
      fullUrl: 'urn:uuid:8724f6e9-c531-48ba-9d34-7e2a81c05fb3',
      resource: {
        resourceType: 'Condition',
        id: '8724f6e9-c531-48ba-9d34-7e2a81c05fb3',
        clinicalStatus: {
          coding: [
            {
              system:
                'http://terminology.hl7.org/CodeSystem/condition-clinical',
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
        subject: {
          reference: 'Patient/78a4d9e5-f2b3-42c8-9a84-52f3e21c2b9d',
          type: 'Patient',
          display: 'Sarah Johnson',
        },
        encounter: {
          reference: 'Encounter/c60544e1-2e37-45fb-8160-3d583902cfde',
          type: 'Encounter',
        },
        onsetDateTime: '2024-03-15T14:20:00.000Z',
        recordedDate: '2024-03-15T16:45:00.000Z',
      },
    },
  ],
}

export const METRIPORT_PATIENT_ID = '78a4d9e5-f2b3-42c8-9a84-52f3e21c2b9d'
export const METRIPORT_ENCOUNTER_ID = 'c60544e1-2e37-45fb-8160-3d583902cfde'
export const METRIPORT_LOCATION_ID = '3ca5e8d2-7c84-45ab-91e7-834f8becde12'
export const METRIPORT_PRACTITIONER_ID = '49e3c8f1-d67a-47b8-b9a2-cf23e8d0e941'
export const METRIPORT_CONDITION_ID = '8724f6e9-c531-48ba-9d34-7e2a81c05fb3'
