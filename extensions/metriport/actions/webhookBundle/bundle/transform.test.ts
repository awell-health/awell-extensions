import { buildTransactionBundle } from './index'
import { patientAdmitBundle } from './__testdata__/patientAdmitBundle'

/**
 * The whole transformation, asserted as one literal.
 *
 * The focused tests in the sibling `.test.ts` files each pin down a single
 * decision; this one exists so a reviewer can see the complete before/after in
 * one place — what `__testdata__/patientAdmitBundle.ts` goes in as, and exactly
 * what Medplum is asked to execute.
 *
 * Reading it against the input bundle, every decision in the design is visible:
 * the Patient entry is gone and its references have become conditional; the
 * account Organization is prepended and the Provenance appended; Metriport's
 * `fullUrl`s are passed through and the intra-bundle references now point at
 * them; each resource has lost `id` and `meta` and gained a Metriport
 * identifier plus a conditional-update `request`; and the Encounter's original
 * visit-number identifier survives alongside ours.
 *
 * It is deliberately a hand-written literal rather than a snapshot: a snapshot
 * records whatever the code did, this records what we intend it to do.
 */
test('transforms the Metriport encounter bundle into an executable transaction', () => {
  const result = buildTransactionBundle({
    bundle: patientAdmitBundle,
    awellPatientId: 'awell-patient-1',
    eventType: 'patient.admit',
    reason: 'Inpatient admission',
    now: '2026-07-29T00:00:00.000Z',
  })

  expect(result).toEqual({
    resourceType: 'Bundle',
    type: 'transaction',
    entry: [
      {
        fullUrl: 'urn:uuid:00000000-0000-4000-8000-000000000001',
        resource: {
          resourceType: 'Organization',
          name: 'Metriport Realtime Monitoring',
        },
        request: {
          method: 'POST',
          url: 'Organization',
          ifNoneExist: 'name:exact=Metriport Realtime Monitoring',
        },
      },
      {
        fullUrl: 'urn:uuid:c60544e1-2e37-45fb-8160-3d583902cfde',
        resource: {
          resourceType: 'Encounter',
          status: 'in-progress',
          period: {
            start: '2024-07-22T19:50:00.000Z',
          },
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
            reference:
              'Patient?identifier=https://awellhealth.com/patients|awell-patient-1',
            type: 'Patient',
            display: 'Sarah Johnson',
          },
          location: [
            {
              location: {
                reference: 'urn:uuid:3ca5e8d2-7c84-45ab-91e7-834f8becde12',
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
                reference: 'urn:uuid:49e3c8f1-d67a-47b8-b9a2-cf23e8d0e941',
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
                reference: 'urn:uuid:8724f6e9-c531-48ba-9d34-7e2a81c05fb3',
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
            {
              system: 'https://metriport.com/fhir/encounter',
              value: 'c60544e1-2e37-45fb-8160-3d583902cfde',
            },
          ],
        },
        request: {
          method: 'PUT',
          url: 'Encounter?identifier=https://metriport.com/fhir/encounter|c60544e1-2e37-45fb-8160-3d583902cfde',
        },
      },
      {
        fullUrl: 'urn:uuid:3ca5e8d2-7c84-45ab-91e7-834f8becde12',
        resource: {
          resourceType: 'Location',
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
          identifier: [
            {
              system: 'https://metriport.com/fhir/location',
              value: '3ca5e8d2-7c84-45ab-91e7-834f8becde12',
            },
          ],
        },
        request: {
          method: 'PUT',
          url: 'Location?identifier=https://metriport.com/fhir/location|3ca5e8d2-7c84-45ab-91e7-834f8becde12',
        },
      },
      {
        fullUrl: 'urn:uuid:49e3c8f1-d67a-47b8-b9a2-cf23e8d0e941',
        resource: {
          resourceType: 'Practitioner',
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
          identifier: [
            {
              system: 'https://metriport.com/fhir/practitioner',
              value: '49e3c8f1-d67a-47b8-b9a2-cf23e8d0e941',
            },
          ],
        },
        request: {
          method: 'PUT',
          url: 'Practitioner?identifier=https://metriport.com/fhir/practitioner|49e3c8f1-d67a-47b8-b9a2-cf23e8d0e941',
        },
      },
      {
        fullUrl: 'urn:uuid:8724f6e9-c531-48ba-9d34-7e2a81c05fb3',
        resource: {
          resourceType: 'Condition',
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
            reference:
              'Patient?identifier=https://awellhealth.com/patients|awell-patient-1',
            type: 'Patient',
            display: 'Sarah Johnson',
          },
          encounter: {
            reference: 'urn:uuid:c60544e1-2e37-45fb-8160-3d583902cfde',
            type: 'Encounter',
          },
          onsetDateTime: '2024-03-15T14:20:00.000Z',
          recordedDate: '2024-03-15T16:45:00.000Z',
          identifier: [
            {
              system: 'https://metriport.com/fhir/condition',
              value: '8724f6e9-c531-48ba-9d34-7e2a81c05fb3',
            },
          ],
        },
        request: {
          method: 'PUT',
          url: 'Condition?identifier=https://metriport.com/fhir/condition|8724f6e9-c531-48ba-9d34-7e2a81c05fb3',
        },
      },
      {
        fullUrl: 'urn:uuid:00000000-0000-4000-8000-000000000002',
        resource: {
          resourceType: 'Provenance',
          target: [
            {
              reference: 'urn:uuid:c60544e1-2e37-45fb-8160-3d583902cfde',
            },
            {
              reference: 'urn:uuid:3ca5e8d2-7c84-45ab-91e7-834f8becde12',
            },
            {
              reference: 'urn:uuid:49e3c8f1-d67a-47b8-b9a2-cf23e8d0e941',
            },
            {
              reference: 'urn:uuid:8724f6e9-c531-48ba-9d34-7e2a81c05fb3',
            },
          ],
          recorded: '2025-03-15T16:45:10.000+00:00',
          agent: [
            {
              type: {
                coding: [
                  {
                    system:
                      'http://terminology.hl7.org/CodeSystem/provenance-participant-type',
                    code: 'assembler',
                    display: 'Assembler',
                  },
                ],
              },
              who: {
                reference: 'urn:uuid:00000000-0000-4000-8000-000000000001',
              },
            },
          ],
          entity: [
            {
              role: 'source',
              what: {
                identifier: {
                  system: 'https://metriport.com/fhir/bundle',
                  value: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
                },
              },
            },
          ],
          reason: [
            {
              text: 'Inpatient admission',
            },
          ],
          activity: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0003',
                code: 'A01',
                display: 'ADT/ACK - Admit/visit notification',
              },
            ],
          },
        },
        request: {
          method: 'POST',
          url: 'Provenance',
        },
      },
    ],
  })
})
