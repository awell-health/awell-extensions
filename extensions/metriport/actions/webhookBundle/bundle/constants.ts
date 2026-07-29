/**
 * Identifier system for the Awell patient id, used to resolve the Medplum
 * Patient by conditional reference rather than by lookup.
 */
export const AWELL_PATIENT_IDENTIFIER_SYSTEM =
  'https://awellhealth.com/patients'

/**
 * Prefix for the identifier we stamp on every Metriport-sourced resource,
 * completed with the lowercased resource type — e.g.
 * `https://metriport.com/fhir/encounter`. Lets each resource be written with a
 * conditional update, which makes a redelivered notification idempotent.
 */
export const METRIPORT_IDENTIFIER_SYSTEM_PREFIX = 'https://metriport.com/fhir/'

/** Identifier system for the source bundle, recorded on `Provenance.entity`. */
export const METRIPORT_BUNDLE_IDENTIFIER_SYSTEM =
  'https://metriport.com/fhir/bundle'

/** Name of the Organization used as the account for imported resources. */
export const METRIPORT_ACCOUNT_ORGANIZATION_NAME =
  'Metriport Realtime Monitoring'

/**
 * Fixed `fullUrl` for the account Organization entry. The urn is scoped to a
 * single bundle, so a constant keeps bundle construction pure — no UUID
 * generation — and keeps the tests literal.
 */
export const ACCOUNT_ORGANIZATION_FULL_URL =
  'urn:uuid:00000000-0000-4000-8000-000000000001'

/** Fixed `fullUrl` for the Provenance entry, for the same reason. */
export const PROVENANCE_FULL_URL =
  'urn:uuid:00000000-0000-4000-8000-000000000002'

/**
 * Resource types with no `identifier` element in FHIR R4, which therefore
 * cannot be written with a conditional update and fall back to POST.
 */
export const RESOURCE_TYPES_WITHOUT_IDENTIFIER = [
  'Provenance',
  'AuditEvent',
  'Binary',
]

export const metriportIdentifierSystem = (resourceType: string): string =>
  `${METRIPORT_IDENTIFIER_SYSTEM_PREFIX}${resourceType.toLowerCase()}`

export const awellPatientReference = (awellPatientId: string): string =>
  `Patient?identifier=${AWELL_PATIENT_IDENTIFIER_SYSTEM}|${awellPatientId}`
