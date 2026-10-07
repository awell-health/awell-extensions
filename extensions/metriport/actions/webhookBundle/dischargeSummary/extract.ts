import {
  type Bundle,
  type CarePlan,
  type CodeableConcept,
  type Composition,
  type CompositionSection,
  type Condition,
  type DiagnosticReport,
  type Encounter,
  type Procedure,
} from '@medplum/fhirtypes'
import {
  ENCOUNTER_DIAGNOSIS_CATEGORY,
  ICD10_CM_SYSTEM,
  MAX_FIELD_CHARS,
  SECTION_CODE,
} from './constants'
import { diagnosticReportText } from './narrative'
import {
  indexBundle,
  resolve,
  resolveAll,
  resourcesOfType,
  type ResourceIndex,
} from './resolve'

/**
 * The discharge summary fields, as data point values. Every text field is
 * omitted when the document does not carry it, never emitted empty, so a
 * missing field reads as missing downstream rather than as a blank value.
 */
export interface DischargeSummaryFields {
  reasonForVisit?: string
  visitDiagnosis?: string
  planOfTreatment?: string
  procedures?: string
  procedureNote?: string
  dischargeDisposition?: string
  dischargeDispositionCode?: string
  dischargeInstructions?: string
  /** JSON: which document this was and which fields it yielded. */
  dischargeSummaryCoverage: string
}

type TextField = Exclude<keyof DischargeSummaryFields, 'dischargeSummaryCoverage'>

const TEXT_FIELDS: TextField[] = [
  'reasonForVisit',
  'visitDiagnosis',
  'planOfTreatment',
  'procedures',
  'procedureNote',
  'dischargeDisposition',
  'dischargeDispositionCode',
  'dischargeInstructions',
]

/** A label for a CodeableConcept: its text, else the first coding's display or code. */
const labelOf = (concept: CodeableConcept | undefined): string | undefined =>
  concept?.text ?? concept?.coding?.[0]?.display ?? concept?.coding?.[0]?.code

const codeOf = (
  concept: CodeableConcept | undefined,
  system: string,
): string | undefined =>
  concept?.coding?.find((coding) => coding.system === system)?.code

const nonEmpty = (parts: Array<string | undefined>): string[] =>
  parts.filter((part): part is string => part !== undefined && part.length > 0)

const joinOrUndefined = (
  parts: Array<string | undefined>,
  separator: string,
): string | undefined => {
  const kept = nonEmpty(parts)
  return kept.length > 0 ? kept.join(separator) : undefined
}

const truncate = (text: string): string =>
  text.length > MAX_FIELD_CHARS
    ? `${text.slice(0, MAX_FIELD_CHARS)}\n[truncated]`
    : text

const sectionsWithCode = (
  composition: Composition,
  code: string,
): CompositionSection[] =>
  (composition.section ?? []).filter((section) =>
    section.code?.coding?.some((coding) => coding.code === code),
  )

const sectionEntries = (sections: CompositionSection[]): Array<{ reference?: string }> =>
  sections.flatMap((section) => section.entry ?? [])

const reasonForVisit = (encounter: Encounter | undefined): string | undefined =>
  joinOrUndefined((encounter?.reasonCode ?? []).map(labelOf), '; ')

/**
 * The encounter's diagnoses, from `Encounter.diagnosis` when the source fills
 * it, else from the Conditions that point back at the encounter and are
 * categorised as encounter diagnoses. Both forms were seen; one source uses
 * each.
 */
const visitDiagnosis = (
  index: ResourceIndex,
  bundle: Bundle,
  encounter: Encounter | undefined,
): string | undefined => {
  if (encounter === undefined) return undefined

  let conditions = resolveAll<Condition>(
    index,
    (encounter.diagnosis ?? []).map((diagnosis) => diagnosis.condition),
    'Condition',
  )

  if (conditions.length === 0) {
    conditions = resourcesOfType<Condition>(bundle, 'Condition').filter(
      (condition) =>
        condition.category?.some((category) =>
          category.coding?.some(
            (coding) => coding.code === ENCOUNTER_DIAGNOSIS_CATEGORY,
          ),
        ) === true &&
        resolve<Encounter>(index, condition.encounter, 'Encounter') ===
          encounter,
    )
  }

  return joinOrUndefined(
    conditions.map((condition) => {
      const label = labelOf(condition.code)
      const code = codeOf(condition.code, ICD10_CM_SYSTEM)
      if (label === undefined) return code
      return code === undefined ? label : `${label} (${code})`
    }),
    '; ',
  )
}

const planOfTreatment = (
  index: ResourceIndex,
  composition: Composition,
): string | undefined => {
  const carePlans = resolveAll<CarePlan>(
    index,
    sectionEntries(sectionsWithCode(composition, SECTION_CODE.planOfTreatment)),
    'CarePlan',
  )

  return joinOrUndefined(
    carePlans.map((carePlan) =>
      joinOrUndefined(
        [
          carePlan.description,
          ...(carePlan.activity ?? []).map(
            (activity) =>
              activity.detail?.description ?? labelOf(activity.detail?.code),
          ),
        ],
        '\n',
      ),
    ),
    '\n\n',
  )
}

const performedOn = (procedure: Procedure): string | undefined => {
  const when = procedure.performedDateTime ?? procedure.performedPeriod?.start
  return when?.slice(0, 10)
}

const procedureLine = (procedure: Procedure): string | undefined => {
  const label = labelOf(procedure.code)
  if (label === undefined) return undefined
  const when = performedOn(procedure)
  return when === undefined ? label : `${label} (${when})`
}

/**
 * The reports the listed procedures point at, read in procedure order. A
 * procedure note is not its own section in these documents: it is the
 * DiagnosticReport behind `Procedure.report`, which the source files under
 * Results.
 */
const procedureNote = (
  index: ResourceIndex,
  procedures: Procedure[],
): string | undefined => {
  const seen = new Set<DiagnosticReport>()
  const notes: Array<string | undefined> = []

  for (const procedure of procedures) {
    for (const report of resolveAll<DiagnosticReport>(
      index,
      procedure.report,
      'DiagnosticReport',
    )) {
      if (seen.has(report)) continue
      seen.add(report)

      const text = diagnosticReportText(report)
      if (text === undefined) continue
      const label = labelOf(report.code) ?? labelOf(procedure.code)
      notes.push(label === undefined ? text : `${label}\n${text}`)
    }
  }

  return joinOrUndefined(notes, '\n\n')
}

/**
 * The instructions note, from the hospital discharge instructions section,
 * else from the discharge instructions document section some sources add.
 */
const dischargeInstructions = (
  index: ResourceIndex,
  composition: Composition,
): string | undefined => {
  for (const code of [
    SECTION_CODE.dischargeInstructions,
    SECTION_CODE.dischargeInstructionsDocument,
  ]) {
    const reports = resolveAll<DiagnosticReport>(
      index,
      sectionEntries(sectionsWithCode(composition, code)),
      'DiagnosticReport',
    )
    const text = joinOrUndefined(reports.map(diagnosticReportText), '\n\n')
    if (text !== undefined) return text
  }
  return undefined
}

const coverage = (
  composition: Composition,
  fields: Partial<DischargeSummaryFields>,
): string =>
  JSON.stringify({
    documentType: composition.type?.coding?.[0]?.code,
    documentTypeText: labelOf(composition.type),
    sections: [
      ...new Set(
        (composition.section ?? []).flatMap(
          (section) =>
            section.code?.coding?.[0]?.code ?? section.title ?? [],
        ),
      ),
    ],
    fields: TEXT_FIELDS.filter((field) => fields[field] !== undefined),
  })

/**
 * Lifts the discharge summary fields a care team asks for out of a
 * `patient.discharge-summary` bundle, or returns nothing for any other bundle.
 *
 * The bundle is Metriport's FHIR conversion of the HIE's discharge summary
 * document: one Composition whose sections carry title-only narratives and
 * point at the resources that hold the actual content, plus the patient's
 * encounter history. Everything here therefore follows references from the
 * Composition and reads the encounter the Composition is about, rather than
 * the first Encounter in the bundle, which is just the oldest visit.
 *
 * Built against the documents seen from two source EHR families; it covers the
 * common pattern rather than every variant, and says what it found in
 * `dischargeSummaryCoverage` so the gap is measurable.
 */
export const extractDischargeSummary = (
  bundle: Bundle,
): DischargeSummaryFields | undefined => {
  const composition = resourcesOfType<Composition>(bundle, 'Composition')[0]
  if (composition === undefined) return undefined

  const index = indexBundle(bundle)
  const encounter = resolve<Encounter>(
    index,
    composition.encounter,
    'Encounter',
  )
  const procedures = resolveAll<Procedure>(
    index,
    sectionEntries(sectionsWithCode(composition, SECTION_CODE.procedures)),
    'Procedure',
  )
  const disposition = encounter?.hospitalization?.dischargeDisposition

  const raw: Partial<DischargeSummaryFields> = {
    reasonForVisit: reasonForVisit(encounter),
    visitDiagnosis: visitDiagnosis(index, bundle, encounter),
    planOfTreatment: planOfTreatment(index, composition),
    procedures: joinOrUndefined(procedures.map(procedureLine), '; '),
    procedureNote: procedureNote(index, procedures),
    dischargeDisposition: labelOf(disposition),
    dischargeDispositionCode: disposition?.coding?.[0]?.code,
    dischargeInstructions: dischargeInstructions(index, composition),
  }

  const fields: Partial<DischargeSummaryFields> = {}
  for (const field of TEXT_FIELDS) {
    const value = raw[field]
    if (value !== undefined && value.length > 0) fields[field] = truncate(value)
  }

  return { ...fields, dischargeSummaryCoverage: coverage(composition, fields) }
}
