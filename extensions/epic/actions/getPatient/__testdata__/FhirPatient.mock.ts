export const FhirPatient = {
  "resourceType": "Patient",
  "id": "e6W8gNFzAcLllJ471FPY4kg3",
  "extension": [
    {
      "valueCodeableConcept": {
        "coding": [
          {
            "system": "urn:oid:1.2.840.114350.1.13.538.3.7.10.698084.130.657370.33419901",
            "code": "male",
            "display": "male"
          }
        ]
      },
      "url": "http://open.epic.com/FHIR/StructureDefinition/extension/legal-sex"
    },
    {
      "valueCodeableConcept": {
        "coding": [
          {
            "system": "http://hl7.org/fhir/gender-identity",
            "code": "male",
            "display": "male"
          }
        ]
      },
      "url": "http://hl7.org/fhir/StructureDefinition/patient-genderIdentity"
    },
    {
      "valueCodeableConcept": {
        "coding": [
          {
            "system": "urn:oid:1.2.840.114350.1.13.538.3.7.10.698084.130.657370.33419901",
            "code": "male",
            "display": "male"
          }
        ]
      },
      "url": "http://open.epic.com/FHIR/StructureDefinition/extension/sex-for-clinical-use"
    },
    {
      "extension": [
        {
          "valueCoding": {
            "system": "urn:oid:2.16.840.1.113883.6.238",
            "code": "2106-3",
            "display": "White"
          },
          "url": "ombCategory"
        },
        {
          "valueString": "White",
          "url": "text"
        }
      ],
      "url": "http://hl7.org/fhir/us/core/StructureDefinition/us-core-race"
    },
    {
      "extension": [
        {
          "valueString": "Unknown",
          "url": "text"
        }
      ],
      "url": "http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity"
    },
    {
      "valueCode": "248153007",
      "url": "http://hl7.org/fhir/us/core/StructureDefinition/us-core-sex"
    },
    {
      "valueCodeableConcept": {
        "coding": [
          {
            "system": "http://loinc.org",
            "code": "LA29518-0",
            "display": "he/him/his/his/himself"
          }
        ]
      },
      "url": "http://open.epic.com/FHIR/StructureDefinition/extension/calculated-pronouns-to-use-for-text"
    }
  ],
  "identifier": [
    {
      "use": "usual",
      "type": {
        "text": "CEID"
      },
      "system": "urn:oid:1.2.840.114350.1.13.538.3.7.3.688884.100",
      "value": "DAV2T4S2MGGJHM8"
    },
    {
      "use": "usual",
      "type": {
        "text": "EPIC"
      },
      "system": "urn:oid:1.2.840.114350.1.13.538.3.7.5.737384.0",
      "value": "E142892"
    },
    {
      "use": "usual",
      "type": {
        "text": "EXTERNAL"
      },
      "system": "urn:oid:1.2.840.114350.1.13.538.3.7.2.698084",
      "value": "Z145050"
    },
    {
      "use": "usual",
      "type": {
        "text": "FHIR"
      },
      "system": "http://open.epic.com/FHIR/StructureDefinition/patient-dstu2-fhir-id",
      "value": "TsrZDuoPOB4WuIY4fFrs8ZynDhWS6OZvUHVdPXFMYBv4B"
    },
    {
      "use": "usual",
      "type": {
        "text": "FHIR STU3"
      },
      "system": "http://open.epic.com/FHIR/StructureDefinition/patient-fhir-id",
      "value": "e6W8gNFzAcLllJ471FPY4kg3"
    },
    {
      "use": "usual",
      "type": {
        "text": "INTERNAL"
      },
      "system": "urn:oid:1.2.840.114350.1.13.538.3.7.2.698084",
      "value": "   Z145050"
    },
    {
      "use": "usual",
      "type": {
        "text": "MYCHARTLOGIN"
      },
      "system": "urn:oid:1.2.840.114350.1.13.538.3.7.3.878082.110",
      "value": "FBUELLERTEST"
    },
    {
      "use": "usual",
      "type": {
        "text": "CKDEHR"
      },
      "system": "urn:oid:1.2.840.114350.1.13.538.3.7.5.737384.1595",
      "value": "P00013"
    },
    {
      "use": "usual",
      "type": {
        "text": "WPRINTERNAL"
      },
      "system": "urn:oid:1.2.840.114350.1.13.538.3.7.2.878082",
      "value": "1720"
    },
    {
      "use": "usual",
      "system": "https://open.epic.com/FHIR/StructureDefinition/PayerMemberId",
      "value": "A33445566"
    }
  ],
  "active": true,
  "name": [
    {
      "use": "official",
      "text": "Ferris Bueller",
      "family": "Bueller",
      "given": [
        "Ferris"
      ]
    },
    {
      "use": "usual",
      "text": "Ferris Bueller",
      "family": "Bueller",
      "given": [
        "Ferris"
      ]
    }
  ],
  "telecom": [
    {
      "system": "phone",
      "value": "702-236-3920",
      "use": "home"
    },
    {
      "system": "phone",
      "value": "702-236-3920",
      "use": "home"
    },
    {
      "system": "phone",
      "value": "702-236-3920",
      "use": "mobile"
    },
    {
      "system": "email",
      "value": "pat.wamboldt@davita.com",
      "rank": 1
    }
  ],
  "gender": "male",
  "birthDate": "1986-05-01",
  "deceasedBoolean": false,
  "address": [
    {
      "use": "home",
      "line": [
        "1060 W. Addison St"
      ],
      "city": "LAS VEGAS",
      "state": "NV",
      "postalCode": "89102",
      "country": "US"
    },
    {
      "use": "old",
      "line": [
        "1060 W. Addison St"
      ],
      "city": "LAS VEGAS",
      "state": "NV",
      "postalCode": "89102",
      "country": "US"
    }
  ],
  "contact": [
    {
      "relationship": [
        {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/v2-0131",
              "code": "C",
              "display": "Emergency Contact"
            },
            {
              "system": "urn:oid:1.2.840.114350.1.13.538.3.7.4.827665.1000",
              "code": "13",
              "display": "Significant Other"
            }
          ],
          "text": "Significant Other"
        }
      ],
      "name": {
        "use": "usual",
        "text": "Peterson,Sloane"
      },
      "telecom": [
        {
          "system": "phone",
          "value": "303-876-5309",
          "use": "mobile"
        }
      ]
    }
  ],
  "communication": [
    {
      "language": {
        "coding": [
          {
            "system": "urn:ietf:bcp:47",
            "code": "en",
            "display": "English"
          }
        ],
        "text": "English"
      },
      "preferred": true
    }
  ],
  "generalPractitioner": [
    {
      "reference": "Practitioner/eXe8ncypCHAwbVuiYSOmTkA3",
      "type": "Practitioner",
      "display": "Deborah Zarek"
    }
  ],
  "managingOrganization": {
    "reference": "Organization/eZvdmN3hJyjFL2C74Glh3ow3",
    "display": "Kidney Specialists of Southern Nevada"
  }
}
