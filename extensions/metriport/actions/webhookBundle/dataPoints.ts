import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  bundle: {
    key: 'bundle',
    valueType: 'json',
  },
  /**
   * The `bundle` rewritten as an executable FHIR transaction, ready to hand to
   * the Medplum `Find or create resource` action. Omitted when the payload is
   * not a Patient Encounter Bundle.
   */
  transactionBundle: {
    key: 'transactionBundle',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>
