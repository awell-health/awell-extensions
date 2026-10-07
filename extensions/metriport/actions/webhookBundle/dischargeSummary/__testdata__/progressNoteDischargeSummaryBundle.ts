import { type Bundle } from '@medplum/fhirtypes'

const html = (markup: string): string => Buffer.from(markup).toString('base64')

/**
 * A `patient.discharge-summary` bundle in the shape one source EHR family
 * sends: the Composition is typed as a Progress note, its sections carry a
 * title-only narrative and point at the resources with the content, notes are
 * `text/html` in `DiagnosticReport.presentedForm`, and the patient's older
 * encounters precede the one the document is about. Synthetic content; the
 * structure mirrors the real bundles surveyed for AWL-5130.
 */
export const progressNoteDischargeSummaryBundle: Bundle = {
  resourceType: 'Bundle',
  id: '4d1e0b1a-9d61-4a62-9a1f-6a0c7a2b7f10',
  type: 'collection',
  timestamp: '2026-09-28T09:28:00.000Z',
  entry: [
    {
      fullUrl: 'urn:uuid:11111111-0000-4000-8000-000000000001',
      resource: {
        resourceType: 'Patient',
        id: '11111111-0000-4000-8000-000000000001',
        name: [{ family: 'Example', given: ['Pat'] }],
      },
    },
    // An earlier visit, first in the bundle. Not what the document is about.
    {
      fullUrl: 'urn:uuid:22222222-0000-4000-8000-000000000001',
      resource: {
        resourceType: 'Encounter',
        id: '22222222-0000-4000-8000-000000000001',
        status: 'finished',
        class: {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: 'IMP',
          display: 'inpatient encounter',
        },
        period: { start: '2026-06-01T10:00:00Z', end: '2026-06-05T12:00:00Z' },
        subject: { reference: 'Patient/11111111-0000-4000-8000-000000000001' },
        reasonCode: [{ text: 'Hip replacement' }],
        hospitalization: {
          dischargeDisposition: {
            coding: [
              {
                system:
                  'http://terminology.hl7.org/CodeSystem/discharge-disposition',
                code: 'rehab',
                display: 'Rehabilitation',
              },
            ],
            text: 'Rehabilitation',
          },
        },
      },
    },
    {
      fullUrl: 'urn:uuid:33333333-0000-4000-8000-000000000001',
      resource: {
        resourceType: 'Composition',
        id: '33333333-0000-4000-8000-000000000001',
        status: 'final',
        type: {
          coding: [
            { system: 'http://loinc.org', code: '11506-3', display: 'Progress note' },
          ],
          text: 'Progress note',
        },
        date: '2026-09-27T18:00:00Z',
        title: 'Discharge Summary',
        author: [{ reference: 'Practitioner/77777777-0000-4000-8000-000000000001' }],
        subject: { reference: 'Patient/11111111-0000-4000-8000-000000000001' },
        encounter: { reference: 'Encounter/22222222-0000-4000-8000-000000000002' },
        section: [
          {
            title: 'Reason for Visit',
            code: {
              coding: [
                { system: 'http://loinc.org', code: '29299-5', display: 'REASON FOR VISIT' },
              ],
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml">Reason for Visit</div>',
            },
          },
          {
            title: 'Discharge Instructions',
            code: {
              coding: [
                { system: 'http://loinc.org', code: '8653-8', display: 'Discharge Instructions' },
              ],
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml">Discharge Instructions</div>',
            },
            entry: [
              { reference: 'DiagnosticReport/55555555-0000-4000-8000-000000000001' },
            ],
          },
          {
            title: 'Plan of Treatment',
            code: {
              coding: [
                { system: 'http://loinc.org', code: '18776-5', display: 'Plan of care note' },
              ],
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml">Plan of Treatment</div>',
            },
            entry: [
              { reference: 'CarePlan/66666666-0000-4000-8000-000000000001' },
              { reference: 'Practitioner/77777777-0000-4000-8000-000000000001' },
            ],
          },
          {
            title: 'Procedures',
            code: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: '47519-4',
                  display: 'History of Procedures Document',
                },
              ],
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml">Procedures</div>',
            },
            entry: [
              { reference: 'Procedure/88888888-0000-4000-8000-000000000001' },
              { reference: 'Procedure/88888888-0000-4000-8000-000000000002' },
              { reference: 'Practitioner/77777777-0000-4000-8000-000000000001' },
            ],
          },
          {
            title: 'Results',
            code: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: '30954-2',
                  display: 'Relevant diagnostic tests/laboratory data Narrative',
                },
              ],
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml">Results</div>',
            },
            entry: [
              { reference: 'DiagnosticReport/55555555-0000-4000-8000-000000000002' },
              { reference: 'Procedure/88888888-0000-4000-8000-000000000001' },
            ],
          },
          {
            title: 'Visit Diagnoses',
            code: {
              coding: [{ system: 'http://loinc.org', code: '51848-0', display: 'Assessments' }],
            },
            text: {
              status: 'generated',
              div: '<div xmlns="http://www.w3.org/1999/xhtml">Visit Diagnoses</div>',
            },
          },
        ],
      },
    },
    // The visit the document is about.
    {
      fullUrl: 'urn:uuid:22222222-0000-4000-8000-000000000002',
      resource: {
        resourceType: 'Encounter',
        id: '22222222-0000-4000-8000-000000000002',
        status: 'finished',
        class: {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: 'EMER',
          display: 'emergency',
        },
        period: { start: '2026-09-26T21:40:00Z', end: '2026-09-27T17:30:00Z' },
        subject: { reference: 'Patient/11111111-0000-4000-8000-000000000001' },
        reasonCode: [{ text: 'Chest pain' }],
        diagnosis: [
          {
            condition: { reference: 'Condition/44444444-0000-4000-8000-000000000001' },
            rank: 1,
          },
          {
            condition: { reference: 'Condition/44444444-0000-4000-8000-000000000002' },
            rank: 2,
          },
        ],
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
      fullUrl: 'urn:uuid:44444444-0000-4000-8000-000000000001',
      resource: {
        resourceType: 'Condition',
        id: '44444444-0000-4000-8000-000000000001',
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
          coding: [{ system: 'http://hl7.org/fhir/sid/icd-10-cm', code: 'R07.9' }],
          text: 'Chest pain, unspecified',
        },
        subject: { reference: 'Patient/11111111-0000-4000-8000-000000000001' },
        encounter: { reference: 'Encounter/22222222-0000-4000-8000-000000000002' },
      },
    },
    {
      fullUrl: 'urn:uuid:44444444-0000-4000-8000-000000000002',
      resource: {
        resourceType: 'Condition',
        id: '44444444-0000-4000-8000-000000000002',
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
          coding: [{ system: 'http://hl7.org/fhir/sid/icd-10-cm', code: 'I10' }],
          text: 'Essential hypertension',
        },
        subject: { reference: 'Patient/11111111-0000-4000-8000-000000000001' },
        encounter: { reference: 'Encounter/22222222-0000-4000-8000-000000000002' },
      },
    },
    {
      fullUrl: 'urn:uuid:66666666-0000-4000-8000-000000000001',
      resource: {
        resourceType: 'CarePlan',
        id: '66666666-0000-4000-8000-000000000001',
        status: 'active',
        intent: 'plan',
        description: 'Follow up with cardiology within one week.',
        subject: { reference: 'Patient/11111111-0000-4000-8000-000000000001' },
        activity: [
          {
            detail: {
              status: 'scheduled',
              description: 'Outpatient stress test.',
            },
          },
        ],
      },
    },
    {
      fullUrl: 'urn:uuid:77777777-0000-4000-8000-000000000001',
      resource: {
        resourceType: 'Practitioner',
        id: '77777777-0000-4000-8000-000000000001',
        name: [{ family: 'Attending', given: ['Alex'] }],
      },
    },
    {
      fullUrl: 'urn:uuid:88888888-0000-4000-8000-000000000001',
      resource: {
        resourceType: 'Procedure',
        id: '88888888-0000-4000-8000-000000000001',
        status: 'completed',
        code: {
          coding: [{ system: 'http://loinc.org', code: '30799-1', display: 'CT Head WO contrast' }],
          text: 'CT Head WO contrast',
        },
        subject: { reference: 'Patient/11111111-0000-4000-8000-000000000001' },
        performedDateTime: '2026-09-26T23:05:00Z',
        report: [
          { reference: 'DiagnosticReport/55555555-0000-4000-8000-000000000002' },
        ],
      },
    },
    {
      fullUrl: 'urn:uuid:88888888-0000-4000-8000-000000000002',
      resource: {
        resourceType: 'Procedure',
        id: '88888888-0000-4000-8000-000000000002',
        status: 'completed',
        code: {
          coding: [{ system: 'http://loinc.org', code: '36554-4', display: 'XR Chest Single view' }],
          text: 'XR Chest Single view',
        },
        subject: { reference: 'Patient/11111111-0000-4000-8000-000000000001' },
        performedDateTime: '2026-09-26T22:10:00Z',
      },
    },
    {
      fullUrl: 'urn:uuid:55555555-0000-4000-8000-000000000001',
      resource: {
        resourceType: 'DiagnosticReport',
        id: '55555555-0000-4000-8000-000000000001',
        status: 'final',
        category: [
          {
            coding: [{ system: 'http://loinc.org', code: '8653-8', display: 'Discharge Instructions' }],
          },
        ],
        code: {
          coding: [{ system: 'http://loinc.org', code: '34895-3', display: 'Education note' }],
          text: 'Education note',
        },
        subject: { reference: 'Patient/11111111-0000-4000-8000-000000000001' },
        encounter: { reference: 'Encounter/22222222-0000-4000-8000-000000000002' },
        presentedForm: [
          {
            contentType: 'text/html',
            data: html(
              '<p>Take aspirin 81&nbsp;mg daily.</p><p>Return to the ED if chest pain returns &amp; does not settle.<br/>Keep your cardiology appointment.</p>',
            ),
          },
        ],
      },
    },
    {
      fullUrl: 'urn:uuid:55555555-0000-4000-8000-000000000002',
      resource: {
        resourceType: 'DiagnosticReport',
        id: '55555555-0000-4000-8000-000000000002',
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://loinc.org',
                code: '30954-2',
                display: 'Relevant diagnostic tests/laboratory data Narrative',
              },
            ],
          },
        ],
        code: {
          coding: [{ system: 'http://loinc.org', code: '30799-1', display: 'CT Head WO contrast' }],
          text: 'CT Head WO contrast',
        },
        subject: { reference: 'Patient/11111111-0000-4000-8000-000000000001' },
        encounter: { reference: 'Encounter/22222222-0000-4000-8000-000000000002' },
        presentedForm: [
          {
            contentType: 'text/html',
            data: html(
              '<div><b>IMPRESSION:</b></div><div>No acute intracranial abnormality.</div>',
            ),
          },
        ],
      },
    },
  ],
}
