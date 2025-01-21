export const FhirPatientNoMatch = {
  resourceType: 'Bundle',
  type: 'searchset',
  total: 0,
  link: [
    {
      relation: 'self',
      url: 'https://vendorservices.epic.com/interconnect-amcurprd-oauth/api/FHIR/R4/Patient?identifier=MRN|2015023',
    },
  ],
  entry: [
    {
      fullUrl: 'urn:uuid:9ed03464-6f59-4f81-bdb0-77109106a215',
      resource: {
        resourceType: 'OperationOutcome',
        issue: [
          {
            severity: 'warning',
            code: 'processing',
            details: {
              coding: [
                {
                  system: 'urn:oid:1.2.840.114350.1.13.0.1.7.2.657369',
                  code: '4101',
                  display: 'Resource request returns no results.',
                },
              ],
              text: 'Resource request returns no results.',
            },
          },
        ],
      },
      search: {
        mode: 'outcome',
      },
    },
  ],
}
