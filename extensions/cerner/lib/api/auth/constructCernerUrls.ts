export const constructCernerUrls = (
  tenantId: string,
): { r4BaseUrl: string; authUrl: string } => {
  return {
    authUrl: `https://authorization.cerner.com/tenants/${tenantId}/protocols/oauth2/profiles/smart-v1/token`,
    r4BaseUrl: `https://fhir-ehr-code.cerner.com/r4/${tenantId}`,
  }
}
