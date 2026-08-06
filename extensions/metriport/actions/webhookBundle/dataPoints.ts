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
  /**
   * Metriport's own UUID for the Encounter in the bundle — not a Medplum
   * resource id. The imported Encounter is addressable in Medplum as
   * `Encounter?identifier=https://metriport.com/fhir/encounter|<encounterId>`.
   * Omitted when the bundle carries no Encounter.
   */
  encounterId: {
    key: 'encounterId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
