import { type Bundle } from '@medplum/fhirtypes'

/**
 * The Metriport id of the Encounter a webhook bundle describes.
 *
 * This is Metriport's own UUID, not a Medplum resource id. It is the value
 * `buildResourceEntry` stamps as `https://metriport.com/fhir/encounter|<id>`,
 * so a care flow resolves the imported Encounter with
 * `Encounter?identifier=https://metriport.com/fhir/encounter|<id>`.
 *
 * Read from any bundle rather than only a `collection`: a Patient Encounter
 * Bundle is guaranteed to carry an Encounter — `buildTransactionBundle` throws
 * without one — and there is no reason to hide the id when another bundle type
 * happens to include one.
 */
export const findEncounterId = (bundle: Bundle): string | undefined =>
  bundle.entry?.find((entry) => entry.resource?.resourceType === 'Encounter')
    ?.resource?.id
