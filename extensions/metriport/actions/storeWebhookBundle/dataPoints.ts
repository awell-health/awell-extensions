import { type DataPointDefinition } from '@awell-health/extensions-core'
import { dischargeSummaryDataPoints } from '../webhookBundle/dischargeSummary'

export const dataPoints = {
  /** Reference to the stored bundle, exactly as Metriport sent it, byte for byte. */
  bundleRef: {
    key: 'bundleRef',
    valueType: 'string',
  },
  /**
   * Reference to the stored `bundle` rewritten as executable FHIR transactions:
   * not one bundle but a list of them, in the order to execute them, which the
   * Medplum "Execute stored bundle" action reads. A large bundle cannot be one
   * transaction: it is over what Medplum accepts in a request and would be one
   * database transaction for as long as it took. Omitted when the payload is not
   * a Patient Encounter Bundle.
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
