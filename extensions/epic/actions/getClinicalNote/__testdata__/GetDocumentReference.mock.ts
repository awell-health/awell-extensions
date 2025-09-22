import { type AxiosResponse } from 'axios'

export const GetDocumentReferenceMockResponse = {
  status: 200,
  statusText: 'OK',
  data: {
    resourceType: 'DocumentReference',
    id: 'e.q.BLfR29vX-T-.y0bQbKg3',
    extension: [
      {
        extension: [
          {
            valueCodeableConcept: {
              coding: [
                {
                  system: 'urn:oid:1.2.840.114350.1.72.1.7.7.10.696784.72072',
                  code: '1',
                  display: 'Signer',
                },
              ],
              text: 'Signer',
            },
            url: 'mode',
          },
          {
            valueDateTime: '2018-10-26T23:04:44Z',
            url: 'time',
          },
          {
            valueReference: {
              display: 'Epic Sandbox, User',
            },
            url: 'party',
          },
        ],
        url: 'http://hl7.org/fhir/5.0/StructureDefinition/extension-DocumentReference.attester',
      },
    ],
    identifier: [
      {
        system: 'urn:oid:1.2.840.114350.1.13.0.1.7.2.727879',
        value: '194922',
      },
      {
        system: 'urn:oid:1.2.840.114350.1.72.3.15',
        value: '1.2.840.114350.1.13.0.1.7.2.727879_194922',
      },
    ],
    status: 'current',
    docStatus: 'final',
    type: {
      coding: [
        {
          system: 'urn:oid:1.2.840.114350.1.13.0.1.7.4.737880.5010',
          code: '1',
          display: 'Progress Notes',
        },
        {
          system: 'urn:oid:1.2.840.114350.1.72.727879.69848980',
          code: '1',
          display: 'Progress Notes',
        },
        {
          system: 'http://loinc.org',
          code: '11506-3',
          display: 'Progress note',
          userSelected: true,
        },
      ],
      text: 'Progress Notes',
    },
    category: [
      {
        coding: [
          {
            system:
              'http://hl7.org/fhir/us/core/CodeSystem/us-core-documentreference-category',
            code: 'clinical-note',
            display: 'Clinical Note',
          },
        ],
        text: 'Clinical Note',
      },
    ],
    subject: {
      reference: 'Patient/e63wRTbPfr1p8UW81d8Seiw3',
      display: 'Mychart, Theodore',
    },
    date: '2018-10-26T23:04:44Z',
    author: [
      {
        type: 'Practitioner',
        display: 'Epic Sandbox, User',
      },
    ],
    authenticator: {
      extension: [
        {
          valueDateTime: '2018-10-26T23:04:44Z',
          url: 'http://open.epic.com/FHIR/StructureDefinition/extension/clinical-note-authentication-instant',
        },
      ],
      type: 'Practitioner',
      display: 'Epic Sandbox, User',
    },
    custodian: {
      identifier: {
        system: 'urn:ietf:rfc:3986',
        value: 'urn:oid:1.2.840.114350.1.13.0.1.7.3.688884.100',
      },
      display: 'FHIR Sandbox',
    },
    securityLabel: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
            code: 'NOPAT',
            display:
              "no disclosure to patient, family or caregivers without attending provider's authorization",
          },
        ],
        text: "no disclosure to patient, family or caregivers without attending provider's authorization",
      },
    ],
    content: [
      {
        attachment: {
          contentType: 'text/html',
          url: 'Binary/ejJD-7U3OqOcsHTnJnjMrDw3',
        },
        format: {
          system: 'http://ihe.net/fhir/ValueSet/IHE.FormatCode.codesystem',
          code: 'urn:ihe:iti:xds:2017:mimeTypeSufficient',
          display: 'mimeType Sufficient',
        },
      },
      {
        attachment: {
          contentType: 'text/rtf',
          url: 'Binary/fKuKS-GnFjPkSYnYLq4EKAjhWrkspV6j2jdSL.E4549g4',
        },
        format: {
          system: 'http://ihe.net/fhir/ValueSet/IHE.FormatCode.codesystem',
          code: 'urn:ihe:iti:xds:2017:mimeTypeSufficient',
          display: 'mimeType Sufficient',
        },
      },
    ],
    context: {
      extension: [
        {
          valueCodeableConcept: {
            coding: [
              {
                system: 'urn:oid:1.2.840.114350.1.13.0.1.7.4.836982.1040',
                code: '3',
                display: 'Registered Nurse',
              },
            ],
            text: 'Registered Nurse',
          },
          url: 'http://open.epic.com/FHIR/StructureDefinition/extension/clinical-note-author-provider-type',
        },
      ],
      encounter: [
        {
          reference: 'Encounter/ecgXt3jVqNNpsXnNXZ3KljA3',
          identifier: {
            use: 'usual',
            system: 'urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8',
            value: '1853',
          },
          display: 'Office Visit',
        },
      ],
      period: {
        start: '2013-11-06T20:45:00Z',
      },
      practiceSetting: {
        coding: [
          {
            system: 'urn:oid:1.2.840.114350.1.13.0.1.7.4.836982.1050',
            code: '9',
            display: 'Family Medicine',
          },
        ],
        text: 'Family Medicine',
      },
    },
  },
} satisfies Partial<AxiosResponse>
