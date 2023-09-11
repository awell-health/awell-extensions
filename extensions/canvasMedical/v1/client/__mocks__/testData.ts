import type {
  AppointmentWithId,
  Appointment,
  TaskWithId,
  Task,
  PatientWithId,
  Patient,
  QuestionnaireResponseWithId,
  QuestionnaireResponse,
} from '../../validation'

export const mockedSettings = {
  client_id: '123',
  client_secret: '123',
  base_url: 'https://example.com',
  auth_url: 'https://example.com/auth/token',
  audience: undefined,
}

export const mockedAppointmentId: string =
  'fec8936b-d38b-43e1-bcf2-62351c0b4f27'

export const mockedAppointmentData: Appointment = {
  resourceType: 'Appointment',
  status: 'proposed',
  contained: [
    {
      resourceType: 'Endpoint',
      id: 'appointment-meeting-endpoint',
      status: 'active',
      connectionType: {
        code: 'https',
      },
      payloadType: [
        {
          coding: [
            {
              code: 'video-call',
            },
          ],
        },
      ],
      address: 'https://url-for-video-chat.example.com?meetingi=abc123',
    },
  ],
  appointmentType: {
    coding: [
      {
        system: 'http://snomed.info/sct',
        code: '448337001',
        display: 'Telemedicine consultation with patient (procedure)',
      },
    ],
  },
  description: 'Weekly check-in.',
  supportingInformation: [
    {
      reference: 'Location/1',
    },
    {
      reference: '#appointment-meeting-endpoint',
      type: 'Endpoint',
    },
  ],
  start: '2021-03-29T13:30:00.000Z',
  end: '2021-03-29T14:00:00.000Z',
  participant: [
    {
      actor: {
        reference: 'Practitioner/e766816672f34a5b866771c773e38f3c',
      },
      status: 'accepted',
    },
    {
      actor: {
        reference: 'Patient/01e226b6ad324595a4b7030d003db06f',
      },
      status: 'accepted',
    },
  ],
}

export const mockedAppointmentResource: AppointmentWithId = {
  id: mockedAppointmentId,
  ...mockedAppointmentData,
}

export const mockedTaskId: string = '6bda0beb-95ba-41fd-9bd1-57091b88f163'

export const mockedTaskData: Task = {
  resourceType: 'Task',
  extension: [
    {
      url: 'http://schemas.canvasmedical.com/fhir/extensions/task-group',
      valueReference: {
        reference: 'Group/',
        display: 'All Responsibilities',
      },
    },
  ],
  status: 'requested',
  requester: {
    reference: 'Practitioner/e766816672f34a5b866771c773e38f3c',
  },
  description: 'Ask patient for new insurance information.',
  for: {
    reference: 'Patient/01e226b6ad324595a4b7030d003db06f',
  },
  owner: {
    reference: 'Practitioner/e766816672f34a5b866771c773e38f3c',
  },
  authoredOn: '2022-03-20T14:00:00.000Z',
  restriction: {
    period: {
      end: '2022-08-01T04:00:00+00:00',
    },
  },
  note: [
    {
      text: 'Please be sure to scan them in at their next visit.',
      time: '2022-03-20T14:00:00.000Z',
      authorReference: {
        reference: 'Practitioner/e766816672f34a5b866771c773e38f3c',
      },
    },
  ],
  input: [
    {
      type: {
        text: 'label',
      },
      valueString: 'Urgent',
    },
  ],
}

export const mockedTaskResource: TaskWithId = {
  id: mockedTaskId,
  ...mockedTaskData,
}

export const mockedPatientId: string = '31365726-b823-4353-8c91-5d4f59d67ed3'

export const mockedPatientData: Patient = {
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

export const mockedMinimalPatientData = {
  resourceType: 'Patient',
  extension: [
    {
      url: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-birthsex',
      valueCode: 'M',
    },
  ],
  active: true,
  name: [
    {
      use: 'official',
      family: 'Awell',
      given: ['Postman', 'Test'],
    },
  ],
  birthDate: '1969-11-13',
}

export const mockedMinimalPatientResource = {
  resourceType: 'Patient',
  id: 'fb5bffffae2c44e49a8d8b409a5c5846',
  meta: {
    versionId: '1',
    lastUpdated: '2023-08-18T10:41:10.809+00:00',
  },
  text: {
    status: 'generated',
    div: '<div xmlns="http://www.w3.org/1999/xhtml"><div class="hapiHeaderText">Postman <b>Awell</b></div><table class="hapiPropertyTable"><tbody><tr><td>Identifier</td><td>248365312</td></tr><tr><td>Date of birth</td><td><span>1969-11-13</span></td></tr></tbody></table></div>',
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
      value: '248365312',
      assigner: {
        display: 'Canvas Medical',
      },
    },
  ],
  active: true,
  name: [
    {
      use: 'official',
      family: 'Awell',
      given: ['Postman', 'Test'],
    },
  ],
  gender: 'male',
  birthDate: '1969-11-13',
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

export const mockedPatientResource: PatientWithId = {
  id: mockedPatientId,
  ...mockedPatientData,
}

export const mockedCreateQuestionnaireResponsesResource: string =
  '9176df1c-b284-43df-9662-c5839e9771f3'

export const mockedCreateQuestionnaireResponsesData: {
  questionnaireId: string
  subjectId: string
  authored: string
  authorId: string
  item: string
} = {
  questionnaireId: '6ec73d3e-d25a-4702-a45b-ff863982bb5c',
  subjectId: '01e226b6ad324595a4b7030d003db06f',
  authored: '2021-09-19T14:54:12.194952+00:00',
  authorId: 'e766816672f34a5b866771c773e38f3c',
  item: '[{"linkId":"a82466d1-1d80-486e-933f-139ba101977d","text":"Tobaccostatus","answer":[{"valueCoding":{"system":"http://snomed.info/sct","code":"8517006","display":"Formeruser"}}]}]',
}

export const mockedQuestionnaireResponseId: string =
  '31365726-b823-4353-8c91-5d4f59d67ed3'

export const mockedQuestionnaireResponseData: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  meta: {
    versionId: '1',
    lastUpdated: '2023-08-29T08:43:42.160+00:00',
  },
  questionnaire: 'Questionnaire/6ec73d3e-d25a-4702-a45b-ff863982bb5c',
  status: 'completed',
  subject: {
    reference: 'Patient/01e226b6ad324595a4b7030d003db06f',
  },
  authored: '2021-09-19T14:54:12.194952+00:00',
  author: {
    reference: 'Practitioner/e766816672f34a5b866771c773e38f3c',
  },
  item: [
    {
      linkId: 'a82466d1-1d80-486e-933f-139ba101977d',
      text: 'Tobacco status',
      answer: [
        {
          valueCoding: {
            system: 'http://snomed.info/sct',
            code: '8517006',
            display: 'Former user',
          },
        },
      ],
    },
  ],
}

export const mockedQuestionnaireResponseResource: QuestionnaireResponseWithId =
  {
    id: mockedQuestionnaireResponseId,
    ...mockedQuestionnaireResponseData,
  }

export const mockedCreateClaimData: any = {
  status: 'active',
  type: JSON.stringify({
    coding: [
      {
        system: 'http://hl7.org/fhir/ValueSet/claim-type',
        code: 'professional',
      },
    ],
  }),
  patientId: '01e226b6ad324595a4b7030d003db06f',
  created: '2020-08-16',
  provider: JSON.stringify({
    reference: 'Practitioner/e766816672f34a5b866771c773e38f3c',
    type: 'http://canvasmedical.com',
  }),
  priority: JSON.stringify({
    coding: [
      {
        code: 'normal',
        system: 'http://hl7.org/fhir/ValueSet/process-priority',
      },
    ],
  }),
  supportingInfo: JSON.stringify([
    {
      sequence: 1,
      category: {
        coding: [
          {
            code: 'patientreasonforvisit',
            system: 'http://hl7.org/fhir/ValueSet/claim-informationcategory',
            display: 'Patient Reason for Visit',
          },
        ],
      },
      valueString: 'This is only...a test',
    },
  ]),
  diagnosis: JSON.stringify([
    {
      sequence: 1,
      diagnosisCodeableConcept: {
        coding: [
          {
            code: 'F41.1',
            system: 'http://hl7.org/fhir/ValueSet/icd-10',
            display: 'Generalized anxiety',
          },
        ],
        text: 'stuff',
      },
    },
  ]),
  insurance: JSON.stringify([
    {
      sequence: 1,
      focal: true,
      coverage: {
        reference: 'Coverage/d7cd54dc-feba-4ea4-9d80-f5e7819e08a0',
      },
    },
  ]),
  item: JSON.stringify([
    {
      sequence: 1,
      diagnosisSequence: [1],
      productOrService: {
        coding: [
          {
            system:
              'http://hl7.org/fhir/us/core/ValueSet/us-core-procedure-code',
            code: 'exam',
            display: 'Office visit',
          },
        ],
      },
      modifier: [
        {
          coding: [
            {
              system:
                'http://hl7.org/fhir/us/carin-bb/ValueSet/AMACPTCMSHCPCSModifiers',
              code: '21',
            },
          ],
        },
      ],
      servicedDate: '2014-08-19',
      quantity: 1,
      unitPrice: {
        value: 75.0,
      },
      net: {
        value: 75.0,
      },
    },
  ]),
}

export const mockedClaimId: string = 'b9fccf85-a68c-4747-a1a5-3f6bfc941fcf'
