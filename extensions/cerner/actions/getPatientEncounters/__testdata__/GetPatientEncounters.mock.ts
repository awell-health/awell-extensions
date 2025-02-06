import { type EncounterSearchResponseType } from '../../../lib/api/FhirR4/schema'

export const GetPatientEncountersMockResponse = {
  resourceType: 'Bundle',
  id: '6c6b5034-74cc-47e3-86f9-2ff6a09441ce',
  type: 'searchset',
  link: [
    {
      relation: 'self',
      url: 'https://fhir-ehr-code.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d/Encounter?patient=12724066',
    },
    {
      relation: 'next',
      url: 'https://fhir-ehr-code.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d/Encounter?patient=12724066&-pageContext=eea510eb-df06-45aa-aeb9-2e6075ac8aea&-pageDirection=NEXT',
    },
  ],
  entry: [
    {
      fullUrl:
        'https://fhir-ehr-code.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d/Encounter/97954225',
      resource: {
        resourceType: 'Encounter',
        id: '97954225',
        meta: {
          versionId: '22',
          lastUpdated: '2024-07-08T03:13:47.000Z',
        },
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Encounter</b></p><p><b>Patient</b>: SMARTS Sr., NANCYS II</p><p><b>Location</b>: Model Behavioral Health Hospital, MX BH Hosp</p><p><b>Type</b>: Outpatient</p><p><b>Class</b>: ambulatory</p><p><b>Status</b>: In Progress</p><p><b>Service Provider</b>: Model Behavioral Health Hospital</p></div>',
        },
        extension: [
          {
            id: 'CA-0',
            extension: [
              {
                id: 'ENCNTR:204298207',
                valueString: 'Full Reg User ID',
                url: 'custom-attribute-name',
              },
              {
                valueString: 'CERN258',
                url: 'custom-attribute-value',
              },
            ],
            url: 'https://fhir-ehr.cerner.com/r4/StructureDefinition/custom-attribute',
          },
          {
            id: 'CA-1',
            extension: [
              {
                id: 'ENCNTR:18702465',
                valueString: 'MSP Complete Date',
                url: 'custom-attribute-name',
              },
              {
                valueDateTime: '2021-07-03T12:00:00.000Z',
                url: 'custom-attribute-value',
              },
            ],
            url: 'https://fhir-ehr.cerner.com/r4/StructureDefinition/custom-attribute',
          },
          {
            valueMoney: {
              value: 0.0,
              currency: 'USD',
            },
            url: 'https://fhir-ehr.cerner.com/r4/StructureDefinition/estimated-financial-responsibility-amount',
          },
        ],
        identifier: [
          {
            use: 'usual',
            type: {
              coding: [
                {
                  system:
                    'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/319',
                  code: '1077',
                  display: 'FIN NBR',
                  userSelected: true,
                },
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                  code: 'AN',
                  display: 'Account number',
                  userSelected: false,
                },
              ],
              text: 'FIN NBR',
            },
            system: 'urn:oid:5.5.5.5.5.5.',
            value: '16131',
            period: {
              start: '2020-08-04T12:37:34.000Z',
            },
          },
        ],
        status: 'in-progress',
        class: {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: 'AMB',
          display: 'ambulatory',
          userSelected: false,
        },
        type: [
          {
            coding: [
              {
                system:
                  'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/71',
                code: '309309',
                display: 'Outpatient',
                userSelected: true,
              },
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0004',
                code: 'O',
                display: 'Outpatient',
                userSelected: false,
              },
            ],
            text: 'Outpatient',
          },
        ],
        subject: {
          reference: 'Patient/12724066',
          display: 'SMARTS Sr., NANCYS II',
        },
        participant: [
          {
            type: [
              {
                coding: [
                  {
                    system:
                      'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/333',
                    code: '1121',
                    display: 'Consulting Physician',
                    userSelected: true,
                  },
                  {
                    system:
                      'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                    code: 'CON',
                    display: 'consultant',
                    userSelected: false,
                  },
                ],
                text: 'Consulting Physician',
              },
            ],
            period: {
              start: '2023-11-21T15:45:00.000Z',
            },
            individual: {
              reference: 'Practitioner/12732065',
              display: 'PWDiabetesMe, Physician - Hospitalist',
            },
          },
          {
            type: [
              {
                coding: [
                  {
                    system:
                      'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/333',
                    code: '1121',
                    display: 'Consulting Physician',
                    userSelected: true,
                  },
                  {
                    system:
                      'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                    code: 'CON',
                    display: 'consultant',
                    userSelected: false,
                  },
                ],
                text: 'Consulting Physician',
              },
            ],
            period: {
              start: '2023-08-25T09:07:28.000Z',
            },
            individual: {
              reference: 'Practitioner/12742905',
              display: 'PWEveryDose, MDHosp',
            },
          },
          {
            type: [
              {
                coding: [
                  {
                    system:
                      'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/333',
                    code: '1121',
                    display: 'Consulting Physician',
                    userSelected: true,
                  },
                  {
                    system:
                      'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                    code: 'CON',
                    display: 'consultant',
                    userSelected: false,
                  },
                ],
                text: 'Consulting Physician',
              },
            ],
            period: {
              start: '2023-08-01T15:17:16.000Z',
            },
            individual: {
              reference: 'Practitioner/12753672',
              display: 'PWZoom, MD Cardio',
            },
          },
          {
            type: [
              {
                coding: [
                  {
                    system:
                      'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/333',
                    code: '681295',
                    display: 'Physician (Office/Clinic Only)',
                    userSelected: true,
                  },
                  {
                    system:
                      'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                    code: 'PPRF',
                    display: 'primary performer',
                    userSelected: false,
                  },
                ],
                text: 'Physician (Office/Clinic Only)',
              },
            ],
            period: {
              start: '2023-11-03T20:27:00.000Z',
            },
            individual: {
              reference: 'Practitioner/12769364',
              display: 'PWLuma, MD',
            },
          },
          {
            type: [
              {
                coding: [
                  {
                    system:
                      'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/333',
                    code: '681274',
                    display: 'Database Coordinator',
                    userSelected: true,
                  },
                  {
                    system:
                      'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                    code: 'PART',
                    display: 'Participation',
                    userSelected: false,
                  },
                ],
                text: 'Database Coordinator',
              },
            ],
            period: {
              start: '2023-11-01T19:28:00.000Z',
            },
            individual: {
              reference: 'Practitioner/12742563',
              display: 'Pivonka, Fran',
            },
          },
          {
            type: [
              {
                coding: [
                  {
                    system:
                      'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/333',
                    code: '681274',
                    display: 'Database Coordinator',
                    userSelected: true,
                  },
                  {
                    system:
                      'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                    code: 'PART',
                    display: 'Participation',
                    userSelected: false,
                  },
                ],
                text: 'Database Coordinator',
              },
            ],
            period: {
              start: '2023-10-09T19:32:00.000Z',
            },
            individual: {
              reference: 'Practitioner/12752117',
              display: 'Joyce, Patrick',
            },
          },
          {
            type: [
              {
                coding: [
                  {
                    system:
                      'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/333',
                    code: '681274',
                    display: 'Database Coordinator',
                    userSelected: true,
                  },
                  {
                    system:
                      'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                    code: 'PART',
                    display: 'Participation',
                    userSelected: false,
                  },
                ],
                text: 'Database Coordinator',
              },
            ],
            period: {
              start: '2023-09-25T21:23:00.000Z',
            },
            individual: {
              reference: 'Practitioner/12752117',
              display: 'Joyce, Patrick',
            },
          },
          {
            type: [
              {
                coding: [
                  {
                    system:
                      'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/333',
                    code: '681295',
                    display: 'Physician (Office/Clinic Only)',
                    userSelected: true,
                  },
                  {
                    system:
                      'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                    code: 'PPRF',
                    display: 'primary performer',
                    userSelected: false,
                  },
                ],
                text: 'Physician (Office/Clinic Only)',
              },
            ],
            period: {
              start: '2023-09-18T13:51:00.000Z',
            },
            individual: {
              reference: 'Practitioner/12744716',
              display: 'PWIntouch, MDCardio',
            },
          },
          {
            type: [
              {
                coding: [
                  {
                    system:
                      'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/333',
                    code: '681274',
                    display: 'Database Coordinator',
                    userSelected: true,
                  },
                  {
                    system:
                      'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                    code: 'PART',
                    display: 'Participation',
                    userSelected: false,
                  },
                ],
                text: 'Database Coordinator',
              },
            ],
            period: {
              start: '2023-09-06T20:37:00.000Z',
            },
            individual: {
              reference: 'Practitioner/12839209',
              display: 'Seelye, Brian',
            },
          },
          {
            type: [
              {
                coding: [
                  {
                    system:
                      'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/333',
                    code: '681274',
                    display: 'Database Coordinator',
                    userSelected: true,
                  },
                  {
                    system:
                      'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                    code: 'PART',
                    display: 'Participation',
                    userSelected: false,
                  },
                ],
                text: 'Database Coordinator',
              },
            ],
            period: {
              start: '2023-07-24T15:33:00.000Z',
            },
            individual: {
              reference: 'Practitioner/12784000',
              display: 'McMillan, Erika',
            },
          },
          {
            type: [
              {
                coding: [
                  {
                    system:
                      'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/333',
                    code: '681274',
                    display: 'Database Coordinator',
                    userSelected: true,
                  },
                  {
                    system:
                      'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                    code: 'PART',
                    display: 'Participation',
                    userSelected: false,
                  },
                ],
                text: 'Database Coordinator',
              },
            ],
            period: {
              start: '2023-05-30T17:46:00.000Z',
            },
            individual: {
              reference: 'Practitioner/12752117',
              display: 'Joyce, Patrick',
            },
          },
          {
            type: [
              {
                coding: [
                  {
                    system:
                      'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/333',
                    code: '681274',
                    display: 'Database Coordinator',
                    userSelected: true,
                  },
                  {
                    system:
                      'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                    code: 'PART',
                    display: 'Participation',
                    userSelected: false,
                  },
                ],
                text: 'Database Coordinator',
              },
            ],
            period: {
              start: '2021-06-22T16:16:40.000Z',
            },
            individual: {
              reference: 'Practitioner/12743472',
              display: 'Allen, Jodi',
            },
          },
          {
            type: [
              {
                coding: [
                  {
                    system:
                      'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/333',
                    code: '242348525',
                    display: 'Chart Review',
                    userSelected: true,
                  },
                  {
                    system:
                      'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                    code: 'PART',
                    display: 'Participation',
                    userSelected: false,
                  },
                ],
                text: 'Chart Review',
              },
            ],
            period: {
              start: '2020-11-24T18:16:18.000Z',
            },
            individual: {
              reference: 'Practitioner/12746397',
              display: 'Pwuptodate, RN',
            },
          },
        ],
        appointment: [
          {
            reference: 'Appointment/4900013',
          },
          {
            reference: 'Appointment/4907570',
          },
        ],
        location: [
          {
            location: {
              reference: 'Location/31103065',
              display: 'Model Behavioral Health Hospital, MX BH Hosp',
            },
            status: 'active',
          },
        ],
        serviceProvider: {
          reference: 'Organization/1054423',
          display: 'Model Behavioral Health Hospital',
        },
      },
      search: {
        mode: 'match',
      },
    },
    {
      fullUrl:
        'https://fhir-ehr-code.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d/Encounter/97954261',
      resource: {
        resourceType: 'Encounter',
        id: '97954261',
        meta: {
          versionId: '1',
          lastUpdated: '2024-07-09T07:01:14.000Z',
        },
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Encounter</b></p><p><b>Patient</b>: SMARTS Sr., NANCYS II</p><p><b>Location</b>: Model Behavioral Health Hospital</p><p><b>Type</b>: Outpatient</p><p><b>Class</b>: ambulatory</p><p><b>Status</b>: In Progress</p><p><b>Service Provider</b>: Model Behavioral Health Hospital</p></div>',
        },
        identifier: [
          {
            use: 'usual',
            type: {
              coding: [
                {
                  system:
                    'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/319',
                  code: '1077',
                  display: 'FIN NBR',
                  userSelected: true,
                },
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                  code: 'AN',
                  display: 'Account number',
                  userSelected: false,
                },
              ],
              text: 'FIN NBR',
            },
            system: 'urn:oid:5.5.5.5.5.5.',
            value: '16132',
            period: {
              start: '2020-08-06T14:42:26.000Z',
            },
          },
        ],
        status: 'in-progress',
        class: {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: 'AMB',
          display: 'ambulatory',
          userSelected: false,
        },
        type: [
          {
            coding: [
              {
                system:
                  'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/71',
                code: '309309',
                display: 'Outpatient',
                userSelected: true,
              },
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0004',
                code: 'O',
                display: 'Outpatient',
                userSelected: false,
              },
            ],
            text: 'Outpatient',
          },
        ],
        subject: {
          reference: 'Patient/12724066',
          display: 'SMARTS Sr., NANCYS II',
        },
        participant: [
          {
            type: [
              {
                coding: [
                  {
                    system:
                      'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/333',
                    code: '1121',
                    display: 'Consulting Physician',
                    userSelected: true,
                  },
                  {
                    system:
                      'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                    code: 'CON',
                    display: 'consultant',
                    userSelected: false,
                  },
                ],
                text: 'Consulting Physician',
              },
            ],
            period: {
              start: '2023-07-21T18:25:00.000Z',
            },
            individual: {
              reference: 'Practitioner/12732059',
              display: 'PWVisualDx, Physician - Hospitalist',
            },
          },
          {
            type: [
              {
                coding: [
                  {
                    system:
                      'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/333',
                    code: '681295',
                    display: 'Physician (Office/Clinic Only)',
                    userSelected: true,
                  },
                  {
                    system:
                      'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                    code: 'PPRF',
                    display: 'primary performer',
                    userSelected: false,
                  },
                ],
                text: 'Physician (Office/Clinic Only)',
              },
            ],
            period: {
              start: '2023-08-29T18:45:00.000Z',
            },
            individual: {
              reference: 'Practitioner/12742919',
              display: 'PWCareDx, MD Cardio',
            },
          },
          {
            type: [
              {
                coding: [
                  {
                    system:
                      'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/333',
                    code: '681274',
                    display: 'Database Coordinator',
                    userSelected: true,
                  },
                  {
                    system:
                      'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                    code: 'PART',
                    display: 'Participation',
                    userSelected: false,
                  },
                ],
                text: 'Database Coordinator',
              },
            ],
            period: {
              start: '2022-06-22T15:44:00.000Z',
            },
            individual: {
              reference: 'Practitioner/12798938',
              display: 'Barr Suffix, Title, Jesse',
            },
          },
        ],
        location: [
          {
            location: {
              reference: 'Location/31098367',
              display: 'Model Behavioral Health Hospital',
            },
            status: 'active',
          },
        ],
        serviceProvider: {
          reference: 'Organization/1054423',
          display: 'Model Behavioral Health Hospital',
        },
      },
      search: {
        mode: 'match',
      },
    },
    {
      fullUrl:
        'https://fhir-ehr-code.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d/Encounter/97954262',
      resource: {
        resourceType: 'Encounter',
        id: '97954262',
        meta: {
          versionId: '0',
          lastUpdated: '2020-08-06T15:21:28.000Z',
        },
        text: {
          status: 'generated',
          div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Encounter</b></p><p><b>Patient</b>: SMARTS Sr., NANCYS II</p><p><b>Location</b>: Model Behavioral Health Hospital</p><p><b>Type</b>: Outpatient</p><p><b>Class</b>: ambulatory</p><p><b>Status</b>: In Progress</p><p><b>Service Provider</b>: Model Behavioral Health Hospital</p></div>',
        },
        identifier: [
          {
            use: 'usual',
            type: {
              coding: [
                {
                  system:
                    'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/319',
                  code: '1077',
                  display: 'FIN NBR',
                  userSelected: true,
                },
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                  code: 'AN',
                  display: 'Account number',
                  userSelected: false,
                },
              ],
              text: 'FIN NBR',
            },
            system: 'urn:oid:5.5.5.5.5.5.',
            value: '16133',
            period: {
              start: '2020-08-06T15:21:28.000Z',
            },
          },
        ],
        status: 'in-progress',
        class: {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: 'AMB',
          display: 'ambulatory',
          userSelected: false,
        },
        type: [
          {
            coding: [
              {
                system:
                  'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/71',
                code: '309309',
                display: 'Outpatient',
                userSelected: true,
              },
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0004',
                code: 'O',
                display: 'Outpatient',
                userSelected: false,
              },
            ],
            text: 'Outpatient',
          },
        ],
        subject: {
          reference: 'Patient/12724066',
          display: 'SMARTS Sr., NANCYS II',
        },
        participant: [
          {
            type: [
              {
                coding: [
                  {
                    system:
                      'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/333',
                    code: '1121',
                    display: 'Consulting Physician',
                    userSelected: true,
                  },
                  {
                    system:
                      'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                    code: 'CON',
                    display: 'consultant',
                    userSelected: false,
                  },
                ],
                text: 'Consulting Physician',
              },
            ],
            period: {
              start: '2022-07-13T07:16:27.000Z',
            },
            individual: {
              reference: 'Practitioner/12763797',
              display: 'PWAmbry, MD, Cardio',
            },
          },
        ],
        location: [
          {
            location: {
              reference: 'Location/31098367',
              display: 'Model Behavioral Health Hospital',
            },
            status: 'active',
          },
        ],
        serviceProvider: {
          reference: 'Organization/1054423',
          display: 'Model Behavioral Health Hospital',
        },
      },
      search: {
        mode: 'match',
      },
    },
  ],
} satisfies EncounterSearchResponseType

export const GetPatientEncountersNoResultsMockResponse = {
  resourceType: 'Bundle',
  id: '3be836bb-76d5-4bc0-a852-f35e24d7ebf8',
  type: 'searchset',
  total: 0,
  link: [
    {
      relation: 'self',
      url: 'https://fhir-ehr-code.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d/Encounter?patient=127240661',
    },
  ],
} satisfies EncounterSearchResponseType
