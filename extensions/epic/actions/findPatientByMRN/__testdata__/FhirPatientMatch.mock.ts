export const FhirPatientMatch = {
  resourceType: 'Bundle',
  type: 'searchset',
  total: 1,
  link: [
    {
      relation: 'self',
      url: 'https://vendorservices.epic.com/interconnect-amcurprd-oauth/api/FHIR/R4/Patient?identifier=MRN|201502',
    },
  ],
  entry: [
    {
      link: [
        {
          relation: 'self',
          url: 'https://vendorservices.epic.com/interconnect-amcurprd-oauth/api/FHIR/R4/Patient/ehZfTJ9tsbEEtj3Gv-xzlYA3',
        },
      ],
      fullUrl:
        'https://vendorservices.epic.com/interconnect-amcurprd-oauth/api/FHIR/R4/Patient/ehZfTJ9tsbEEtj3Gv-xzlYA3',
      resource: {
        resourceType: 'Patient',
        id: 'ehZfTJ9tsbEEtj3Gv-xzlYA3',
        extension: [
          {
            valueCodeableConcept: {
              coding: [
                {
                  system:
                    'urn:oid:1.2.840.114350.1.13.0.1.7.10.698084.130.657370.19999000',
                  code: 'male',
                  display: 'male',
                },
              ],
            },
            url: 'http://open.epic.com/FHIR/StructureDefinition/extension/legal-sex',
          },
          {
            valueCodeableConcept: {
              coding: [
                {
                  system:
                    'urn:oid:1.2.840.114350.1.13.0.1.7.10.698084.130.657370.19999000',
                  code: 'male',
                  display: 'male',
                },
              ],
            },
            url: 'http://open.epic.com/FHIR/StructureDefinition/extension/sex-for-clinical-use',
          },
          {
            extension: [
              {
                valueCoding: {
                  system: 'http://terminology.hl7.org/CodeSystem/v3-NullFlavor',
                  code: 'UNK',
                  display: 'Unknown',
                },
                url: 'ombCategory',
              },
              {
                valueString: 'Unknown',
                url: 'text',
              },
            ],
            url: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-race',
          },
          {
            extension: [
              {
                valueString: 'Unknown',
                url: 'text',
              },
            ],
            url: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity',
          },
          {
            valueCode: '248153007',
            url: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-sex',
          },
          {
            valueCodeableConcept: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: 'LA29518-0',
                  display: 'he/him/his/his/himself',
                },
              ],
            },
            url: 'http://open.epic.com/FHIR/StructureDefinition/extension/calculated-pronouns-to-use-for-text',
          },
        ],
        identifier: [
          {
            use: 'usual',
            type: {
              text: 'CEID',
            },
            system: 'urn:epic:apporchard.curprod',
            value: 'AO16D7L2DWNS497',
          },
          {
            use: 'usual',
            type: {
              text: 'EPIC',
            },
            system: 'urn:oid:1.2.840.114350.1.13.0.1.7.5.737384.0',
            value: 'E1712',
          },
          {
            use: 'usual',
            type: {
              text: 'EXTERNAL',
            },
            system: 'urn:oid:1.2.840.114350.1.13.0.1.7.2.698084',
            value: 'Z4998',
          },
          {
            use: 'usual',
            type: {
              text: 'FHIR',
            },
            system:
              'http://open.epic.com/FHIR/StructureDefinition/patient-dstu2-fhir-id',
            value: 'T5A4rDhR7OzIZZrDriMjIavZaMBjRBl9Qi.90lWyps8cB',
          },
          {
            use: 'usual',
            type: {
              text: 'FHIR STU3',
            },
            system:
              'http://open.epic.com/FHIR/StructureDefinition/patient-fhir-id',
            value: 'ehZfTJ9tsbEEtj3Gv-xzlYA3',
          },
          {
            use: 'usual',
            type: {
              text: 'INTERNAL',
            },
            system: 'urn:oid:1.2.840.114350.1.13.0.1.7.2.698084',
            value: '     Z4998',
          },
          {
            use: 'usual',
            type: {
              text: 'MRN',
            },
            system: 'urn:oid:1.2.840.114350.1.13.0.1.7.5.737384.14',
            value: '201502',
          },
          {
            use: 'usual',
            type: {
              text: 'MYCHARTLOGIN',
            },
            system: 'urn:oid:1.2.840.114350.1.13.0.1.7.3.878082.110',
            value: 'CLINDOCJEAN',
          },
          {
            use: 'usual',
            type: {
              text: 'WPRINTERNAL',
            },
            system: 'urn:oid:1.2.840.114350.1.13.0.1.7.2.878082',
            value: '117',
          },
          {
            use: 'usual',
            system: 'urn:oid:2.16.840.1.113883.4.1',
            _value: {
              extension: [
                {
                  valueString: 'xxx-xx-6749',
                  url: 'http://hl7.org/fhir/StructureDefinition/rendered-value',
                },
              ],
            },
          },
        ],
        active: true,
        name: [
          {
            use: 'official',
            text: 'Jean Clin Doc',
            family: 'Clin Doc',
            given: ['Jean'],
          },
          {
            use: 'usual',
            text: 'Jean Clin Doc',
            family: 'Clin Doc',
            given: ['Jean'],
          },
        ],
        telecom: [
          {
            system: 'phone',
            value: '608-213-5806',
            use: 'home',
          },
          {
            system: 'phone',
            value: '608-272-5000',
            use: 'work',
          },
        ],
        gender: 'male',
        birthDate: '1950-02-22',
        deceasedBoolean: false,
        address: [
          {
            use: 'home',
            line: ['134 Elm Street'],
            city: 'Madison',
            state: 'WI',
            postalCode: '53706',
            country: 'US',
          },
        ],
        contact: [
          {
            relationship: [
              {
                coding: [
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
                    code: 'C',
                    display: 'Emergency Contact',
                  },
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
                    code: 'N',
                    display: 'Next-of-Kin',
                  },
                  {
                    system: 'urn:oid:1.2.840.114350.1.13.0.1.7.4.827665.1000',
                    code: '14',
                    display: 'Sister',
                  },
                ],
                text: 'Sister',
              },
            ],
            name: {
              use: 'usual',
              text: 'Sally Tonga',
            },
            telecom: [
              {
                system: 'phone',
                value: '608-921-8342',
                use: 'home',
              },
            ],
          },
          {
            relationship: [
              {
                coding: [
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
                    code: 'E',
                    display: 'Employer',
                  },
                ],
              },
            ],
            organization: {
              display: 'Ehs Generic Employer',
            },
          },
        ],
        managingOrganization: {
          reference: 'Organization/enRyWnSP963FYDpoks4NHOA3',
          display: 'Epic Hospital System',
        },
      },
      search: {
        mode: 'match',
      },
    },
  ],
}
