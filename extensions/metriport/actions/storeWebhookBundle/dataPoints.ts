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
   * The discharge summary fields, present only when the bundle is a
   * `patient.discharge-summary` document. Unlike the bundle itself these are
   * small, so they are returned as plain data points rather than stored.
   */
  ...dischargeSummaryDataPoints,
} satisfies Record<string, DataPointDefinition>
