import { type PatientReadResponseType } from '../../../lib/api/FhirR4/schema'

export const patientReadMock = {
  resourceType: 'Patient',
  id: '13115400',
  meta: {
    versionId: '0',
    lastUpdated: '2025-02-06T08:36:10.000Z',
  },
  text: {
    status: 'generated',
    div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Patient</b></p><p><b>Name</b>: Hellemans Awell, Nick</p><p><b>Status</b>: Active</p></div>',
  },
  identifier: [
    {
      id: 'CI-495086825-0',
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
      value: '292392',
      // @ts-expect-error - _value looks like a FHIR extension
      _value: {
        extension: [
          {
            valueString: '00000292392',
            url: 'http://hl7.org/fhir/StructureDefinition/rendered-value',
          },
        ],
      },
      period: {
        start: '2025-02-06T08:36:10.000Z',
      },
    },
    {
      id: 'CI-495086823-1',
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
      // @ts-expect-error - _system looks like a FHIR extension
      _system: {
        extension: [
          {
            valueCode: 'unknown',
            url: 'http://hl7.org/fhir/StructureDefinition/data-absent-reason',
          },
        ],
      },
      value: '302337',
      _value: {
        extension: [
          {
            valueString: '302337',
            url: 'http://hl7.org/fhir/StructureDefinition/rendered-value',
          },
        ],
      },
      period: {
        start: '2025-02-06T08:36:10.000Z',
      },
    },
  ],
  active: true,
  name: [
    {
      id: 'CI-13115400-0',
      use: 'official',
      text: 'Hellemans Awell, Nick',
      family: 'Hellemans Awell',
      given: ['Nick'],
    },
  ],
  _gender: {
    extension: [
      {
        valueCode: 'unknown',
        url: 'http://hl7.org/fhir/StructureDefinition/data-absent-reason',
      },
    ],
  },
} satisfies PatientReadResponseType
