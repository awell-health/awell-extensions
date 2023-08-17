import type { PatientWithId, Patient } from '../validation/dto/patient.zod'

export const samplePatientId: { id: string } = {
  id: '31365726-b823-4353-8c91-5d4f59d67ed3',
}

export const samplePatientData: Patient = {
  resourceType: 'Patient',
  extension: [
    {
      url: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-birthsex',
      valueCode: 'M',
    },
    {
      url: 'http://schemas.canvasmedical.com/fhir/extensions/preferred-pharmacy',
      extension: [
        {
          url: 'ncpdp-id',
          valueIdentifier: {
            value: '1123152',
            system:
              'http://terminology.hl7.org/CodeSystem/NCPDPProviderIdentificationNumber',
          },
        },
      ],
    },
    {
      url: 'http://schemas.canvasmedical.com/fhir/extensions/preferred-pharmacy',
      extension: [
        {
          url: 'ncpdp-id',
          valueIdentifier: {
            value: '1123152',
            system:
              'http://terminology.hl7.org/CodeSystem/NCPDPProviderIdentificationNumber',
          },
        },
      ],
    },
    {
      url: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-race',
      extension: [
        {
          url: 'ombCategory',
          valueCoding: {
            code: '2131-1',
            system: 'urn:oid:2.16.840.1.113883.6.238',
          },
        },
      ],
    },
    {
      url: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-race',
      extension: [
        {
          url: 'ombCategory',
          valueCoding: {
            code: '2131-1',
            system: 'urn:oid:2.16.840.1.113883.6.238',
          },
        },
      ],
    },
    {
      url: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity',
      extension: [
        {
          url: 'ombCategory',
          valueCoding: {
            code: '2186-5',
            system: 'urn:oid:2.16.840.1.113883.6.238',
          },
        },
      ],
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/tz-code',
      valueCode: 'America/New_York',
    },
    {
      url: 'http://schemas.canvasmedical.com/fhir/extensions/clinical-note',
      valueString: 'I am a clinical caption from a Create message',
    },
    {
      url: 'http://schemas.canvasmedical.com/fhir/extensions/administrative-note',
      valueString: 'I am an administrative caption from a Create message',
    },
  ],
  identifier: [
    {
      use: 'usual',
      system: 'HealthCo',
      value: 's07960990',
    },
  ],

  name: [
    {
      use: 'official',
      family: 'Cube',
      given: ['Rubik', 'NEW NAME'],
    },
    {
      use: 'nickname',
      given: ['Nick Name'],
    },
  ],
  telecom: [
    {
      system: 'phone',
      value: '5554320555',
      use: 'mobile',
      rank: 1,
    },
    {
      system: 'email',
      value: 'i.k.bahar@example.com',
      use: 'work',
      rank: 1,
    },
  ],
  gender: 'male',
  birthDate: '1949-11-13',
  address: [
    {
      use: 'home',
      type: 'both',
      text: '4247 Murry Street, Chesapeake, VA 23322',
      line: ['4247 Murry Street'],
      city: 'Chesapeake',
      state: 'VA',
      postalCode: '23322',
    },
  ],
  contact: [
    {
      name: {
        text: 'Test Spouse',
      },
      relationship: [
        {
          text: 'Spouse',
        },
      ],
      telecom: [
        {
          system: 'email',
          value: 'test@me.com',
        },
      ],
      extension: [
        {
          url: 'http://schemas.canvasmedical.com/fhir/extensions/emergency-contact',
          valueBoolean: true,
        },
        {
          url: 'http://schemas.canvasmedical.com/fhir/extensions/authorized-for-release-of-information',
          valueBoolean: true,
        },
      ],
    },
    {
      name: {
        text: 'Test Mom',
      },
      relationship: [
        {
          text: 'Mom',
        },
      ],
      telecom: [
        {
          system: 'phone',
          value: '7177327068',
        },
      ],
      extension: [
        {
          url: 'http://schemas.canvasmedical.com/fhir/extensions/authorized-for-release-of-information',
          valueBoolean: true,
        },
      ],
    },
    {
      name: {
        text: 'Test Email',
      },
      relationship: [
        {
          text: 'Father',
        },
      ],
      telecom: [
        {
          system: 'email',
          value: 'test.email@email.test',
        },
      ],
    },
  ],
  active: true,
}

export const samplePatientResource: PatientWithId = {
  ...samplePatientId,
  ...samplePatientData,
}
