import { type DataPointDefinition } from '@awell-health/extensions-core'
import { dischargeSummaryDataPoints } from '../webhookBundle/dischargeSummary'

export const dataPoints = {
  /** Reference to the stored bundle, exactly as Metriport sent it. */
  bundleRef: {
    key: 'bundleRef',
    valueType: 'string',
  },
  /**
   * Reference to the stored `bundle` rewritten as an executable FHIR
   * transaction. Omitted when the payload is not a Patient Encounter Bundle.
   */
  transactionBundleRef: {
    key: 'transactionBundleRef',
    valueType: 'string',
  },
  /**
   * Metriport's own UUID for the Encounter in the bundle — not a Medplum
   * resource id. Omitted when the bundle carries no Encounter.
   */
  encounterId: {
    key: 'encounterId',
    valueType: 'string',
  },
  /**
   * `Encounter.period.start`. Omitted, like every Encounter field below, when
   * absent, and for a `patient.discharge-summary` event.
   */
  admissionDatetime: {
    key: 'admissionDatetime',
    valueType: 'date',
  },
  /** `Encounter.period.end`; absent while the patient is still admitted. */
  dischargeDatetime: {
    key: 'dischargeDatetime',
    valueType: 'date',
  },
  /**
   * `Encounter.class.display`, e.g. "Ambulatory". When the class is missing or
   * "unknown", the `encounterType` value instead.
   */
  encounterClass: {
    key: 'encounterClass',
    valueType: 'string',
  },
  /**
   * The first `Encounter.type` text containing "Inpatient", "Ambulatory" or
   * "Emergency", ignoring case.
   */
  encounterType: {
    key: 'encounterType',
    valueType: 'string',
  },
  /** `Encounter.location[0].location.display`. */
  encounterLocation: {
    key: 'encounterLocation',
    valueType: 'string',
  },
  /** The first `Encounter.reasonCode` text. */
  encounterReason: {
    key: 'encounterReason',
    valueType: 'string',
  },
  /** The display text of every `Encounter.diagnosis` condition. */
  encounterDiagnoses: {
    key: 'encounterDiagnoses',
    valueType: 'strings_array',
  },
  /**
   * The discharge summary fields, present only when the bundle is a
   * `patient.discharge-summary` document. Unlike the bundle itself these are
   * small, so they are returned as plain data points rather than stored.
   */
  ...dischargeSummaryDataPoints,
} satisfies Record<string, DataPointDefinition>
