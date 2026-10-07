import { type Bundle } from '@medplum/fhirtypes'

const plain = (text: string): string => Buffer.from(text).toString('base64')

/**
 * A `patient.discharge-summary` bundle in the shape the other source family
 * sends: a Summary of episode note (CCD) whose section titles differ from the
 * Progress note family, whose notes are `text/plain`, and whose encounter
 * carries no reason code and no `diagnosis` list (the Conditions point back
 * at the encounter instead). It has no CarePlan and its procedures carry no
 * report. Synthetic content; the structure mirrors a real bundle surveyed for
 * AWL-5130.
 */
export const ccdDischargeSummaryBundle: Bundle = {
  resourceType: 'Bundle',
  id: '9c2f4e7d-3b1a-4c8e-b2d4-0f6a9e1c5d21',
  type: 'collection',
  timestamp: '2026-10-03T19:25:00.000Z',
  entry: [
    {
      fullUrl: 'urn:uuid:aaaaaaaa-0000-4000-8000-000000000001',
      resource: {
        resourceType: 'Patient',
        id: 'aaaaaaaa-0000-4000-8000-000000000001',
        name: [{ family: 'Sample', given: ['Sam'] }],
      },
    },
    {
      fullUrl: 'urn:uuid:bbbbbbbb-0000-4000-8000-000000000001',
      resource: {
        resourceType: 'Composition',
        id: 'bbbbbbbb-0000-4000-8000-000000000001',
        status: 'final',
        type: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '34133-9',
              display: 'Summary of episode note',
            },
          ],
          text: 'Summary of episode note',
        },
        date: '2026-10-03T12:00:00Z',
        title: 'Continuity of Care Document',
        author: [{ reference: 'Practitioner/99999999-0000-4000-8000-000000000001' }],
        subject: { reference: 'Patient/aaaaaaaa-0000-4000-8000-000000000001' },
        encounter: { reference: 'Encounter/cccccccc-0000-4000-8000-000000000001' },
        section: [
          {
            title: 'Encounter',
            code: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: '46240-8',
                  display: 'History of Hospitalizations+Outpatient visits',
                },
              ],
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml">Encounter</div>',
            },
            entry: [
              { reference: 'Condition/dddddddd-0000-4000-8000-000000000001' },
              { reference: 'Condition/dddddddd-0000-4000-8000-000000000002' },
            ],
          },
          {
            title: 'Treatment Plan',
            code: {
              coding: [
                { system: 'http://loinc.org', code: '18776-5', display: 'Plan of care note' },
              ],
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml">Treatment Plan</div>',
            },
          },
          {
            title: 'Procedures',
            code: {
              coding: [
                { system: 'http://loinc.org', code: '47519-4', display: 'History of Procedures' },
              ],
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml">Procedures</div>',
            },
            entry: [{ reference: 'Procedure/eeeeeeee-0000-4000-8000-000000000001' }],
          },
          {
            title: 'Hospital Discharge Instructions',
            code: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: '8653-8',
                  display: 'Hospital Discharge Instructions',
                },
              ],
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml">Hospital Discharge Instructions</div>',
            },
            entry: [
              { reference: 'DiagnosticReport/ffffffff-0000-4000-8000-000000000001' },
            ],
          },
          {
            title: 'Discharge instructions',
            code: { coding: [{ system: 'http://loinc.org', code: '74213-0' }] },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml">Discharge instructions</div>',
            },
            entry: [
              { reference: 'DiagnosticReport/ffffffff-0000-4000-8000-000000000002' },
              { reference: 'Practitioner/99999999-0000-4000-8000-000000000001' },
            ],
          },
          {
            title: 'Hospital Course',
            code: {
              coding: [{ system: 'http://loinc.org', code: '8648-8', display: 'Hospital Course' }],
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml">Hospital Course</div>',
            },
            entry: [
              { reference: 'DiagnosticReport/ffffffff-0000-4000-8000-000000000003' },
            ],
          },
        ],
      },
    },
    {
      fullUrl: 'urn:uuid:cccccccc-0000-4000-8000-000000000001',
      resource: {
        resourceType: 'Encounter',
        id: 'cccccccc-0000-4000-8000-000000000001',
        status: 'unknown',
        class: {
          system: 'http://terminology.hl7.org/ValueSet/v3-Unknown',
          code: 'UNK',
          display: 'unknown',
        },
        period: { start: '2026-09-29T08:00:00Z', end: '2026-10-02T15:00:00Z' },
        subject: { reference: 'Patient/aaaaaaaa-0000-4000-8000-000000000001' },
        hospitalization: {
          dischargeDisposition: {
            coding: [
              {
                system:
                  'http://terminology.hl7.org/CodeSystem/discharge-disposition',
                code: 'home',
                display: 'Home',
              },
            ],
            text: 'Home',
          },
        },
      },
    },
    {
      fullUrl: 'urn:uuid:dddddddd-0000-4000-8000-000000000001',
      resource: {
        resourceType: 'Condition',
        id: 'dddddddd-0000-4000-8000-000000000001',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                code: 'encounter-diagnosis',
              },
            ],
          },
        ],
        code: {
          coding: [
            { system: 'http://hl7.org/fhir/sid/icd-10-cm', code: 'A41.9' },
            { system: 'http://snomed.info/sct', code: '91302008' },
          ],
          text: 'Sepsis, unspecified organism',
        },
        subject: { reference: 'Patient/aaaaaaaa-0000-4000-8000-000000000001' },
        encounter: { reference: 'Encounter/cccccccc-0000-4000-8000-000000000001' },
      },
    },
    {
      fullUrl: 'urn:uuid:dddddddd-0000-4000-8000-000000000002',
      resource: {
        resourceType: 'Condition',
        id: 'dddddddd-0000-4000-8000-000000000002',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                code: 'encounter-diagnosis',
              },
            ],
          },
        ],
        code: {
          coding: [{ system: 'http://hl7.org/fhir/sid/icd-10-cm', code: 'E11.9' }],
          text: 'Type 2 diabetes mellitus without complications',
        },
        subject: { reference: 'Patient/aaaaaaaa-0000-4000-8000-000000000001' },
        encounter: { reference: 'Encounter/cccccccc-0000-4000-8000-000000000001' },
      },
    },
    // A problem-list Condition on the same encounter, which is not a visit diagnosis.
    {
      fullUrl: 'urn:uuid:dddddddd-0000-4000-8000-000000000003',
      resource: {
        resourceType: 'Condition',
        id: 'dddddddd-0000-4000-8000-000000000003',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                code: 'problem-list-item',
              },
            ],
          },
        ],
        code: {
          coding: [{ system: 'http://hl7.org/fhir/sid/icd-10-cm', code: 'Z87.891' }],
          text: 'Personal history of nicotine dependence',
        },
        subject: { reference: 'Patient/aaaaaaaa-0000-4000-8000-000000000001' },
        encounter: { reference: 'Encounter/cccccccc-0000-4000-8000-000000000001' },
      },
    },
    {
      fullUrl: 'urn:uuid:eeeeeeee-0000-4000-8000-000000000001',
      resource: {
        resourceType: 'Procedure',
        id: 'eeeeeeee-0000-4000-8000-000000000001',
        status: 'completed',
        code: {
          coding: [{ system: 'http://snomed.info/sct', code: '392230005' }],
          text: 'Central venous catheter placement',
        },
        subject: { reference: 'Patient/aaaaaaaa-0000-4000-8000-000000000001' },
        performedDateTime: '2026-09-29T11:30:00Z',
      },
    },
    {
      fullUrl: 'urn:uuid:99999999-0000-4000-8000-000000000001',
      resource: {
        resourceType: 'Practitioner',
        id: '99999999-0000-4000-8000-000000000001',
        name: [{ family: 'Hospitalist', given: ['Harper'] }],
      },
    },
    {
      fullUrl: 'urn:uuid:ffffffff-0000-4000-8000-000000000001',
      resource: {
        resourceType: 'DiagnosticReport',
        id: 'ffffffff-0000-4000-8000-000000000001',
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://loinc.org',
                code: '8653-8',
                display: 'Hospital Discharge Instructions',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '8653-8',
              display: 'Hospital Discharge instructions',
            },
          ],
          text: 'Hospital Discharge instructions',
        },
        subject: { reference: 'Patient/aaaaaaaa-0000-4000-8000-000000000001' },
        encounter: { reference: 'Encounter/cccccccc-0000-4000-8000-000000000001' },
        presentedForm: [
          {
            contentType: 'text/plain',
            data: plain(
              'Complete the full course of antibiotics.\r\n\r\n\r\nReturn to the emergency department for fever above 101F.   ',
            ),
          },
        ],
      },
    },
    {
      fullUrl: 'urn:uuid:ffffffff-0000-4000-8000-000000000002',
      resource: {
        resourceType: 'DiagnosticReport',
        id: 'ffffffff-0000-4000-8000-000000000002',
        status: 'final',
        category: [{ coding: [{ system: 'http://loinc.org', code: '74213-0' }] }],
        code: {
          coding: [{ system: 'http://loinc.org', code: '34109-9', display: 'Note' }],
          text: 'Note',
        },
        subject: { reference: 'Patient/aaaaaaaa-0000-4000-8000-000000000001' },
        encounter: { reference: 'Encounter/cccccccc-0000-4000-8000-000000000001' },
        presentedForm: [
          {
            contentType: 'text/plain',
            data: plain('The long-form discharge instructions document.'),
          },
        ],
      },
    },
    {
      fullUrl: 'urn:uuid:ffffffff-0000-4000-8000-000000000003',
      resource: {
        resourceType: 'DiagnosticReport',
        id: 'ffffffff-0000-4000-8000-000000000003',
        status: 'final',
        category: [
          { coding: [{ system: 'http://loinc.org', code: '8648-8', display: 'Hospital Course' }] },
        ],
        code: {
          coding: [{ system: 'http://loinc.org', code: '8648-8', display: 'Hospital course note' }],
          text: 'Hospital course note',
        },
        subject: { reference: 'Patient/aaaaaaaa-0000-4000-8000-000000000001' },
        encounter: { reference: 'Encounter/cccccccc-0000-4000-8000-000000000001' },
        presentedForm: [
          {
            contentType: 'text/plain',
            data: plain('Admitted with sepsis, treated with IV antibiotics, improved.'),
          },
        ],
      },
    },
  ],
}
