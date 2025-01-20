export const FhirPatient = {
  resourceType: 'Patient',
  id: 'ePYvjhzgI56-88pdl89yRRQ3',
  meta: {
    security: [
      {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
        code: 'PATRPT',
        display: 'patient reported',
      },
      {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
        code: 'UNCERTREL',
        display: 'uncertain reliability',
      },
    ],
  },
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
      system: 'urn:oid:1.2.840.114350.1.13.0.1.7.3.688884.100',
      value: 'FHR8V9S9K9VSTNT',
    },
    {
      use: 'usual',
      type: {
        text: 'EPIC',
      },
      system: 'urn:oid:1.2.840.114350.1.13.0.1.7.5.737384.0',
      value: 'E11629',
    },
    {
      use: 'usual',
      type: {
        text: 'EXTERNAL',
      },
      system: 'urn:oid:1.2.840.114350.1.13.0.1.7.2.698084',
      value: 'Z6315',
    },
    {
      use: 'usual',
      type: {
        text: 'FHIR',
      },
      system:
        'http://open.epic.com/FHIR/StructureDefinition/patient-dstu2-fhir-id',
      value: 'TmZzIDkISjanyXDdAa7StWPQ3I4sWpHFnQqef3.cSGcAB',
    },
    {
      use: 'usual',
      type: {
        text: 'FHIR STU3',
      },
      system: 'http://open.epic.com/FHIR/StructureDefinition/patient-fhir-id',
      value: 'ePYvjhzgI56-88pdl89yRRQ3',
    },
    {
      use: 'usual',
      type: {
        text: 'INTERNAL',
      },
      system: 'urn:oid:1.2.840.114350.1.13.0.1.7.2.698084',
      value: '     Z6315',
    },
    {
      use: 'usual',
      system: 'urn:oid:2.16.840.1.113883.4.1',
      _value: {
        extension: [
          {
            valueString: 'xxx-xx-6669',
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
      text: 'Nick Test',
      family: 'Test',
      given: ['Nick'],
    },
    {
      use: 'usual',
      text: 'Nick Test',
      family: 'Test',
      given: ['Nick'],
    },
  ],
  telecom: [
    {
      system: 'email',
      value: 'nick@awellhealth.com',
      rank: 1,
    },
  ],
  gender: 'male',
  birthDate: '1993-11-30',
  deceasedBoolean: false,
  address: [
    {
      use: 'home',
      line: ['100 Milky Way', 'Learning Campus'],
      city: 'Verona',
      state: 'WI',
      postalCode: '53593',
      period: {
        start: '2025-01-20',
      },
    },
  ],
}
