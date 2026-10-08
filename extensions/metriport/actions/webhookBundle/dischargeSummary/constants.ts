/**
 * LOINC codes of the Composition sections the discharge summary fields are
 * read from. Section *titles* vary by source EHR ("Plan of Treatment" in one,
 * "Treatment Plan" in another); the codes do not, so they are what we key on.
 * https://loinc.org
 */
export const SECTION_CODE = {
  /** Reason for visit Narrative. Seen with no entries: the text is on the Encounter. */
  reasonForVisit: '29299-5',
  /** Plan of care note. Entries are CarePlans. */
  planOfTreatment: '18776-5',
  /** History of Procedures Document. Entries are Procedures. */
  procedures: '47519-4',
  /** Hospital discharge instructions. Entries are DiagnosticReports carrying the note. */
  dischargeInstructions: '8653-8',
  /**
   * Discharge instructions (the document type, as opposed to the section).
   * Some sources add it beside 8653-8 with the fuller note; it is the fallback.
   */
  dischargeInstructionsDocument: '74213-0',
} as const

export const ICD10_CM_SYSTEM = 'http://hl7.org/fhir/sid/icd-10-cm'

/** `Condition.category` code marking a diagnosis made during the encounter. */
export const ENCOUNTER_DIAGNOSIS_CATEGORY = 'encounter-diagnosis'

/**
 * Upper bound on any one text field. Observed notes top out around 30 KB; the
 * bound only exists so a pathological document cannot push an activity result
 * back over the message size limit that `Store Webhook Bundle` exists to avoid.
 */
export const MAX_FIELD_CHARS = 100_000
