export const FhirPatientMatch = {
  resourceType: 'Bundle',
  id: '908f1999-5eb7-41db-a9b8-431baeb84e06',
  type: 'searchset',
  total: 1,
  link: [
    {
      relation: 'self',
      url: 'https://fhir-ehr-code.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d/Patient?identifier=urn%3Aoid%3A2.16.840.1.113883.6.1000%7C292405',
    },
  ],
  entry: [
    {
      fullUrl:
        'https://fhir-ehr-code.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d/Patient/13115413',
      resource: {
        resourceType: 'Patient',
        id: '13115413',
        meta: {
          versionId: '0',
          lastUpdated: '2025-02-06T09:14:37.000Z',
        },
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Patient</b></p><p><b>Name</b>: Nick 4, Awell 4</p><p><b>Status</b>: Active</p><p><b>Administrative Gender</b>: Female</p></div>',
        },
        identifier: [
          {
            id: 'CI-495086988-0',
            use: 'usual',
            type: {
              coding: [
                {
                  system:
                    'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/4',
                  code: '10',
                  display: 'MRN',
                  userSelected: true,
                },
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                  code: 'MR',
                  display: 'Medical record number',
                  userSelected: false,
                },
              ],
              text: 'MRN',
            },
            system: 'urn:oid:2.16.840.1.113883.6.1000',
            value: '292405',
            _value: {
              extension: [
                {
                  valueString: '00000292405',
                  url: 'http://hl7.org/fhir/StructureDefinition/rendered-value',
                },
              ],
            },
            period: {
              start: '2025-02-06T09:14:37.000Z',
            },
          },
          {
            id: 'CI-495086986-2',
            use: 'usual',
            type: {
              coding: [
                {
                  system:
                    'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/4',
                  code: '2553236785',
                  display: 'MIllennium Person Identifier',
                  userSelected: true,
                },
              ],
              text: 'MIllennium Person Identifier',
            },
            _system: {
              extension: [
                {
                  valueCode: 'unknown',
                  url: 'http://hl7.org/fhir/StructureDefinition/data-absent-reason',
                },
              ],
            },
            value: '302350',
            _value: {
              extension: [
                {
                  valueString: '302350',
                  url: 'http://hl7.org/fhir/StructureDefinition/rendered-value',
                },
              ],
            },
            period: {
              start: '2025-02-06T09:14:37.000Z',
            },
          },
        ],
        active: true,
        name: [
          {
            id: 'CI-13115413-0',
            use: 'official',
            text: 'Nick 4, Awell 4',
            family: 'Nick 4',
            given: ['Awell 4'],
          },
        ],
        telecom: [
          {
            id: 'CI-EM-30653335-0',
            system: 'email',
            value: 'info@awellhealth.com',
            use: 'home',
            rank: 1,
          },
        ],
        gender: 'female',
      },
      search: {
        mode: 'match',
      },
    },
  ],
}
