/**
 * The external system whose keys this extension stamps, declared once on the
 * extension and read by the runtime. Metriport serves us its own FHIR
 * implementation and the patient we get notified about is one we created in
 * Metriport, so its namespace is Metriport's.
 */
export const METRIPORT_IDENTIFIER_SYSTEM = 'https://metriport.com'
