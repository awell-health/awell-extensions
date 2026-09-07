import { type Bundle } from '@medplum/fhirtypes'

/**
 * A `medical.discharge-summary` bundle: the FHIR conversion of the matching
 * source document, not the ADT Patient Encounter Bundle. It still carries the
 * Encounter for the same visit (visit number `987654321`, the one in
 * `patientAdmitBundle`) so the summary converges on the encounter the ADT
 * messages already wrote. The document's own resources are left out: they are
 * not modelled yet.
 */
export const dischargeSummaryBundle: Bundle = {
  resourceType: 'Bundle',
  id: 'f1e2d3c4-b5a6-4978-8a9b-0c1d2e3f4a5b',
  type: 'collection',
  timestamp: '2025-03-18T11:02:00.000+00:00',
  entry: [
    {
      fullUrl: 'urn:uuid:78a4d9e5-f2b3-42c8-9a84-52f3e21c2b9d',
      resource: {
        resourceType: 'Patient',
        id: '78a4d9e5-f2b3-42c8-9a84-52f3e21c2b9d',
        name: [{ use: 'official', family: 'Johnson', given: ['Sarah'] }],
        gender: 'female',
        birthDate: '1975-06-15',
      },
    },
    {
      fullUrl: 'urn:uuid:c60544e1-2e37-45fb-8160-3d583902cfde',
      resource: {
        resourceType: 'Encounter',
        id: 'c60544e1-2e37-45fb-8160-3d583902cfde',
        status: 'finished',
        class: {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: 'IMP',
          display: 'inpatient encounter',
        },
        period: {
          start: '2024-07-22T19:50:00.000Z',
          end: '2024-07-25T14:10:00.000Z',
        },
        subject: { reference: 'Patient/78a4d9e5-f2b3-42c8-9a84-52f3e21c2b9d' },
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
            },
            value: '987654321',
          },
        ],
      },
    },
  ],
}
