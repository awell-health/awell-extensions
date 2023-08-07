import { type PatientWithID } from '../validation/dto/patient.zod'

const patientResource: PatientWithID = {
  resourceType: 'Patient',
  id: '436283f2e4ea4cbd91accc84a79ce466',
  meta: {
    versionId: '1',
    lastUpdated: '2023-08-07T02:16:24.126+00:00',
  },
  text: {
    status: 'generated',
    div: '<div xmlns="http://www.w3.org/1999/xhtml"><div class="hapiHeaderText">Danijel <b>AWell</b></div><table class="hapiPropertyTable"><tbody><tr><td>Identifier</td><td>380367612</td></tr><tr><td>Date of birth</td><td><span>1979-02-07</span></td></tr></tbody></table></div>',
  },
  extension: [
    {
      url: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-birthsex',
      valueCode: 'M',
    },
    {
      url: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity',
      extension: [
        {
          url: 'text',
          valueString: 'UNK',
        },
      ],
    },
    {
      url: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-race',
      extension: [
        {
          url: 'text',
          valueString: 'UNK',
        },
      ],
    },
  ],
  identifier: [
    {
      use: 'usual',
      type: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
            code: 'MR',
          },
        ],
      },
      system: 'http://canvasmedical.com',
      value: '380367612',
      assigner: {
        display: 'Canvas Medical',
      },
    },
  ],
  active: true,
  name: [
    {
      use: 'official',
      family: 'AWell',
      given: ['Danijel'],
    },
  ],
  telecom: [
    {
      id: 'af39736c-dfaf-4f54-9135-9348a4f4ae5c',
      extension: [
        {
          url: 'http://schemas.canvasmedical.com/fhir/extensions/has-consent',
          valueBoolean: false,
        },
      ],
      system: 'phone',
      value: '7072121331',
      use: 'home',
      rank: 0,
    },
    {
      id: '24ab2a19-d42e-4306-a5c6-7fa35f9ecdff',
      extension: [
        {
          url: 'http://schemas.canvasmedical.com/fhir/extensions/has-consent',
          valueBoolean: false,
        },
      ],
      system: 'email',
      value: 'danijel@awellhealth.com',
      use: 'home',
      rank: 0,
    },
  ],
  gender: 'male',
  birthDate: '1979-02-07',
  deceasedBoolean: false,
  photo: [
    {
      url: 'https://d3hn0m4rbsz438.cloudfront.net/avatar1.png',
    },
  ],
  communication: [
    {
      language: {
        coding: [
          {
            system: 'http://hl7.org/fhir/ValueSet/all-languages',
            code: 'en',
            display: 'English',
          },
        ],
        text: 'English',
      },
    },
  ],
}

export default patientResource
