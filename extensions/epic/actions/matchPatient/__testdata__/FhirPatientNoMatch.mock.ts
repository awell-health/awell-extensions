export const FhirPatientNoMatch = {
  resourceType: 'Bundle',
  type: 'searchset',
  total: 0,
  link: [
    {
      relation: 'self',
      url: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/Patient/$match',
    },
  ],
  entry: [
    {
      fullUrl: 'urn:uuid:18659f02-4d69-4de8-b803-5d8434912dc6',
      resource: {},
      search: {},
    },
  ],
}
