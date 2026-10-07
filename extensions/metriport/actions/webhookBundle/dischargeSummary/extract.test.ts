import { type Bundle, type Encounter } from '@medplum/fhirtypes'
import { MAX_FIELD_CHARS } from './constants'
import { extractDischargeSummary } from './extract'
import { ccdDischargeSummaryBundle } from './__testdata__/ccdDischargeSummaryBundle'
import { progressNoteDischargeSummaryBundle } from './__testdata__/progressNoteDischargeSummaryBundle'
import { patientAdmitBundle } from '../bundle/__testdata__/patientAdmitBundle'
import { dischargeSummaryBundle } from '../../../ingestion/adt/__testdata__/dischargeSummaryBundle'

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))

describe('Metriport discharge summary - extractDischargeSummary', () => {
  test('yields nothing for a bundle without a Composition', () => {
    expect(extractDischargeSummary(patientAdmitBundle)).toBeUndefined()
    // The ingestion fixture is a summary bundle reduced to Patient + Encounter.
    expect(extractDischargeSummary(dischargeSummaryBundle)).toBeUndefined()
    expect(
      extractDischargeSummary({ resourceType: 'Bundle', type: 'searchset' }),
    ).toBeUndefined()
  })

  describe('a Progress note document', () => {
    const fields = extractDischargeSummary(progressNoteDischargeSummaryBundle)!

    test('lifts all seven fields from the resources the sections point at', () => {
      expect(fields).toEqual({
        reasonForVisit: 'Chest pain',
        visitDiagnosis: 'Chest pain, unspecified (R07.9); Essential hypertension (I10)',
        planOfTreatment:
          'Follow up with cardiology within one week.\nOutpatient stress test.',
        procedures: 'CT Head WO contrast (2026-09-26); XR Chest Single view (2026-09-26)',
        procedureNote: 'CT Head WO contrast\nIMPRESSION:\nNo acute intracranial abnormality.',
        dischargeDisposition: 'Home',
        dischargeDispositionCode: 'home',
        dischargeInstructions:
          'Take aspirin 81 mg daily.\nReturn to the ED if chest pain returns & does not settle.\nKeep your cardiology appointment.',
        dischargeSummaryCoverage: expect.any(String),
      })
    })

    test('reads the encounter the Composition is about, not the first Encounter in the bundle', () => {
      // The first Encounter is an older inpatient stay discharged to rehab.
      expect(fields.reasonForVisit).not.toBe('Hip replacement')
      expect(fields.dischargeDispositionCode).toBe('home')
    })

    test('reports the document type, its sections and the fields found', () => {
      expect(JSON.parse(fields.dischargeSummaryCoverage)).toEqual({
        documentType: '11506-3',
        documentTypeText: 'Progress note',
        sections: ['29299-5', '8653-8', '18776-5', '47519-4', '30954-2', '51848-0'],
        fields: [
          'reasonForVisit',
          'visitDiagnosis',
          'planOfTreatment',
          'procedures',
          'procedureNote',
          'dischargeDisposition',
          'dischargeDispositionCode',
          'dischargeInstructions',
        ],
      })
    })
  })

  describe('a Summary of episode note (CCD) document', () => {
    const fields = extractDischargeSummary(ccdDischargeSummaryBundle)!

    test('lifts what the document carries and omits what it does not', () => {
      expect(fields).toEqual({
        visitDiagnosis:
          'Sepsis, unspecified organism (A41.9); Type 2 diabetes mellitus without complications (E11.9)',
        procedures: 'Central venous catheter placement (2026-09-29)',
        dischargeDisposition: 'Home',
        dischargeDispositionCode: 'home',
        dischargeInstructions:
          'Complete the full course of antibiotics.\n\nReturn to the emergency department for fever above 101F.',
        dischargeSummaryCoverage: expect.any(String),
      })
      expect(JSON.parse(fields.dischargeSummaryCoverage)).toMatchObject({
        documentType: '34133-9',
        fields: [
          'visitDiagnosis',
          'procedures',
          'dischargeDisposition',
          'dischargeDispositionCode',
          'dischargeInstructions',
        ],
      })
    })

    test('finds the visit diagnoses through the Conditions that point at the encounter', () => {
      // No Encounter.diagnosis on this document; the problem-list Condition on
      // the same encounter is not a visit diagnosis and is left out.
      expect(fields.visitDiagnosis).not.toContain('nicotine')
    })

    test('prefers the hospital discharge instructions section over the document section', () => {
      expect(fields.dischargeInstructions).not.toContain('long-form')
    })

    test('falls back to the discharge instructions document section', () => {
      const bundle = clone(ccdDischargeSummaryBundle)
      bundle.entry = bundle.entry!.filter(
        (entry) => entry.resource?.id !== 'ffffffff-0000-4000-8000-000000000001',
      )
      expect(extractDischargeSummary(bundle)!.dischargeInstructions).toBe(
        'The long-form discharge instructions document.',
      )
    })
  })

  describe('resilience', () => {
    test('omits the encounter fields when the Composition points at an encounter that is not in the bundle', () => {
      const bundle = clone(progressNoteDischargeSummaryBundle)
      bundle.entry = bundle.entry!.filter(
        (entry) => entry.resource?.id !== '22222222-0000-4000-8000-000000000002',
      )
      const fields = extractDischargeSummary(bundle)!
      expect(fields.reasonForVisit).toBeUndefined()
      expect(fields.visitDiagnosis).toBeUndefined()
      expect(fields.dischargeDisposition).toBeUndefined()
      expect(fields.dischargeDispositionCode).toBeUndefined()
      // Section-driven fields are unaffected.
      expect(fields.procedures).toBeDefined()
      expect(fields.dischargeInstructions).toBeDefined()
    })

    test('resolves references written as urn:uuid as well as Type/id', () => {
      const bundle: Bundle = clone(progressNoteDischargeSummaryBundle)
      const composition = bundle.entry!.find(
        (entry) => entry.resource?.resourceType === 'Composition',
      )!.resource as { encounter?: { reference?: string } }
      composition.encounter = {
        reference: 'urn:uuid:22222222-0000-4000-8000-000000000002',
      }
      expect(extractDischargeSummary(bundle)!.reasonForVisit).toBe('Chest pain')
    })

    test('falls back to the coding when a concept has no text', () => {
      const bundle: Bundle = clone(progressNoteDischargeSummaryBundle)
      const encounter = bundle.entry!.find(
        (entry) => entry.resource?.id === '22222222-0000-4000-8000-000000000002',
      )!.resource as Encounter
      encounter.reasonCode = [
        { coding: [{ system: 'http://snomed.info/sct', code: '29857009', display: 'Chest pain' }] },
      ]
      encounter.hospitalization!.dischargeDisposition!.text = undefined
      const fields = extractDischargeSummary(bundle)!
      expect(fields.reasonForVisit).toBe('Chest pain')
      expect(fields.dischargeDisposition).toBe('Home')
    })

    test('ignores a section entry that points at nothing or at the wrong type', () => {
      const bundle: Bundle = clone(progressNoteDischargeSummaryBundle)
      const composition = bundle.entry!.find(
        (entry) => entry.resource?.resourceType === 'Composition',
      )!.resource as { section: Array<{ code: { coding: Array<{ code: string }> }; entry?: Array<{ reference: string }> }> }
      const instructions = composition.section.find(
        (section) => section.code.coding[0].code === '8653-8',
      )!
      instructions.entry = [
        { reference: 'DiagnosticReport/does-not-exist' },
        { reference: 'Practitioner/77777777-0000-4000-8000-000000000001' },
      ]
      const fields = extractDischargeSummary(bundle)!
      expect(fields.dischargeInstructions).toBeUndefined()
      expect(JSON.parse(fields.dischargeSummaryCoverage).fields).not.toContain(
        'dischargeInstructions',
      )
    })

    test('bounds a pathological note instead of emitting it whole', () => {
      const bundle: Bundle = clone(progressNoteDischargeSummaryBundle)
      const report = bundle.entry!.find(
        (entry) => entry.resource?.id === '55555555-0000-4000-8000-000000000001',
      )!.resource as { presentedForm: Array<{ contentType: string; data: string }> }
      report.presentedForm = [
        {
          contentType: 'text/plain',
          data: Buffer.from('x'.repeat(MAX_FIELD_CHARS + 10)).toString('base64'),
        },
      ]
      const text = extractDischargeSummary(bundle)!.dischargeInstructions!
      expect(text.length).toBe(MAX_FIELD_CHARS + '\n[truncated]'.length)
      expect(text.endsWith('[truncated]')).toBe(true)
    })
  })
})
