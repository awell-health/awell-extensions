/**
 * The external system whose keys this extension stamps, declared once on the
 * extension and read by the runtime. Metriport serves us its own FHIR
 * implementation and the patient we get notified about is one we created in
 * Metriport, so its namespace is Metriport's.
 */
export const METRIPORT_IDENTIFIER_SYSTEM = 'https://metriport.com'

/**
 * Prefix for the identifier stamped on a resource Metriport serves us,
 * completed with the lowercased resource type — e.g.
 * `https://metriport.com/fhir/location`. Keyed on Metriport's own resource id,
 * so a redelivered notification upserts rather than duplicating, whether the
 * resource is being written to the FHIR store or saved as an Awell object.
 */
export const METRIPORT_IDENTIFIER_SYSTEM_PREFIX = 'https://metriport.com/fhir/'

export const metriportIdentifierSystem = (resourceType: string): string =>
  `${METRIPORT_IDENTIFIER_SYSTEM_PREFIX}${resourceType.toLowerCase()}`
