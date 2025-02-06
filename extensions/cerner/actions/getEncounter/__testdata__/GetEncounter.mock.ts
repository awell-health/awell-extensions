import { type EncounterReadResponseType } from '../../../lib/api/FhirR4/schema'

export const GetEncounterMockResponse = {
  resourceType: 'Encounter',
  id: '97939518',
  meta: {
    versionId: '108',
    lastUpdated: '2025-01-06T12:40:46.000Z',
  },
  text: {
    status: 'generated',
    div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Encounter</b></p><p><b>Patient</b>: SMARTS Sr., NANCYS II</p><p><b>Location</b>: Model Hospital, MX Hospital, NU05, 102, A</p><p><b>Type</b>: Emergency</p><p><b>Service Type</b>: Medicine-General</p><p><b>Class</b>: emergency</p><p><b>Status</b>: Finished</p><p><b>Period Start Date</b>: Sep  1, 2015 12:00 A.M. UTC</p><p><b>Period End Date</b>: Feb 17, 2021  9:15 P.M. UTC</p><p><b>Reason For Visit</b>: Illness</p><p><b>Attending Physician</b>: Cerner Test, Physician - Hospitalist Cerner</p><p><b>Service Provider</b>: Model Hospital</p></div>',
  },
  extension: [
    {
      id: 'CA-0',
      extension: [
        {
          id: 'ENCNTR:2572582103',
          valueString: 'Driving Dx',
          url: 'custom-attribute-name',
        },
        {
          valueCodeableConcept: {
            coding: [
              {
                system:
                  'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/nomenclature',
                code: '13249728',
                display: 'Primary stabbing headache',
                userSelected: false,
              },
            ],
            text: 'Primary stabbing headache',
          },
          url: 'custom-attribute-value',
        },
      ],
      url: 'https://fhir-ehr.cerner.com/r4/StructureDefinition/custom-attribute',
    },
    {
      id: 'CA-1',
      extension: [
        {
          id: 'ENCNTR:204298207',
          valueString: 'Full Reg User ID',
          url: 'custom-attribute-name',
        },
        {
          valueString: 'JG015148',
          url: 'custom-attribute-value',
        },
      ],
      url: 'https://fhir-ehr.cerner.com/r4/StructureDefinition/custom-attribute',
    },
    {
      id: 'CA-2',
      extension: [
        {
          id: 'ENCNTR:17368048',
          valueString: 'Full Reg Date/Time',
          url: 'custom-attribute-name',
        },
        {
          valueDateTime: '2019-12-26T15:41:52.000Z',
          url: 'custom-attribute-value',
        },
      ],
      url: 'https://fhir-ehr.cerner.com/r4/StructureDefinition/custom-attribute',
    },
    {
      id: 'CA-3',
      extension: [
        {
          id: 'ENCNTR:4047481',
          valueString: 'Conversation',
          url: 'custom-attribute-name',
        },
        {
          valueCodeableConcept: {
            coding: [
              {
                system:
                  'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/100040',
                code: '4630114',
                display: 'Register Patient',
                userSelected: true,
              },
            ],
            text: 'Register Patient',
          },
          url: 'custom-attribute-value',
        },
      ],
      url: 'https://fhir-ehr.cerner.com/r4/StructureDefinition/custom-attribute',
    },
    {
      id: 'CA-4',
      extension: [
        {
          id: 'ENCNTR:34310433',
          valueString: 'Complete Reg?',
          url: 'custom-attribute-name',
        },
        {
          valueCodeableConcept: {
            coding: [
              {
                system:
                  'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/20322',
                code: '3542949',
                display: 'Yes',
                userSelected: true,
              },
            ],
            text: 'Yes',
          },
          url: 'custom-attribute-value',
        },
      ],
      url: 'https://fhir-ehr.cerner.com/r4/StructureDefinition/custom-attribute',
    },
    {
      id: 'CA-5',
      extension: [
        {
          id: 'ENCNTR:684109',
          valueString: 'Accident Related Visit',
          url: 'custom-attribute-name',
        },
        {
          valueCodeableConcept: {
            coding: [
              {
                system:
                  'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/100700',
                code: '684155',
                display: 'No',
                userSelected: true,
              },
            ],
            text: 'No',
          },
          url: 'custom-attribute-value',
        },
      ],
      url: 'https://fhir-ehr.cerner.com/r4/StructureDefinition/custom-attribute',
    },
    {
      valueMoney: {
        value: 10.0,
        currency: 'USD',
      },
      url: 'https://fhir-ehr.cerner.com/r4/StructureDefinition/estimated-financial-responsibility-amount',
    },
    {
      valueCodeableConcept: {
        coding: [
          {
            system:
              'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/4003489',
            code: '269411463',
            display: '1st Attempt - Left Message',
            userSelected: true,
          },
        ],
        text: '1st Attempt - Left Message',
      },
      url: 'https://fhir-ehr.cerner.com/r4/StructureDefinition/payment-collection-status',
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
      value: '15951',
      period: {
        start: '2015-09-01T00:00:00.000Z',
      },
    },
  ],
  status: 'finished',
  class: {
    system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
    code: 'EMER',
    display: 'emergency',
    userSelected: false,
  },
  type: [
    {
      coding: [
        {
          system:
            'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/71',
          code: '309310',
          display: 'Emergency',
          userSelected: true,
        },
        {
          system: 'http://terminology.hl7.org/CodeSystem/v2-0004',
          code: 'E',
          display: 'Emergency',
          userSelected: false,
        },
      ],
      text: 'Emergency',
    },
  ],
  serviceType: {
    coding: [
      {
        system:
          'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/34',
        code: '313012',
        display: 'Medicine-General',
        userSelected: true,
      },
      {
        system: 'http://snomed.info/sct',
        code: '700232004',
        display: 'General medical service (qualifier value)',
        userSelected: false,
      },
    ],
    text: 'Medicine-General',
  },
  priority: {
    coding: [
      {
        system:
          'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/3',
        code: '670840',
        display: 'Elective',
        userSelected: true,
      },
      {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActPriority',
        code: 'EL',
        display: 'elective',
        userSelected: false,
      },
    ],
    text: 'Elective',
  },
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
              code: '1119',
              display: 'Attending Physician',
              userSelected: true,
            },
            {
              system:
                'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
              code: 'ATND',
              display: 'attender',
              userSelected: false,
            },
          ],
          text: 'Attending Physician',
        },
      ],
      period: {
        start: '2019-12-26T15:41:55.000Z',
      },
      individual: {
        reference: 'Practitioner/4122622',
        display: 'Cerner Test, Physician - Hospitalist Cerner',
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
        start: '2021-04-21T22:17:01.000Z',
      },
      individual: {
        reference: 'Practitioner/12747925',
        display: 'PWASHA, MD, Cardio',
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
        start: '2021-03-03T17:11:49.000Z',
      },
      individual: {
        reference: 'Practitioner/12747925',
        display: 'PWASHA, MD, Cardio',
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
        start: '2021-01-21T07:49:00.000Z',
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
        start: '2021-01-13T18:31:00.000Z',
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
        start: '2021-01-13T16:48:00.000Z',
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
        start: '2020-12-17T23:00:54.000Z',
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
        start: '2020-12-17T20:51:00.000Z',
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
        start: '2020-12-14T17:51:00.000Z',
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
        start: '2020-10-29T19:43:00.000Z',
      },
      individual: {
        reference: 'Practitioner/12745086',
        display: 'PWVitel Net, MD Cardio',
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
        start: '2020-08-24T19:02:54.000Z',
        end: '2020-08-24T20:01:01.000Z',
      },
      individual: {
        reference: 'Practitioner/12732049',
        display: 'PWUpToDate, Physician - Primary Care',
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
        start: '2020-04-30T17:47:00.000Z',
        end: '2020-04-30T18:01:18.000Z',
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
        start: '2020-04-24T18:27:00.000Z',
        end: '2020-04-24T19:01:26.000Z',
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
              code: '1124',
              display: 'Other',
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
          text: 'Other',
        },
      ],
      period: {
        start: '2020-10-26T19:09:16.000Z',
      },
      individual: {
        reference: 'Practitioner/12742566',
        display: 'McGinn, Aaron',
      },
    },
    {
      type: [
        {
          coding: [
            {
              system:
                'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/333',
              code: '1124',
              display: 'Other',
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
          text: 'Other',
        },
      ],
      period: {
        start: '2020-10-21T17:34:00.000Z',
      },
      individual: {
        reference: 'Practitioner/12742566',
        display: 'McGinn, Aaron',
      },
    },
    {
      type: [
        {
          coding: [
            {
              system:
                'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/333',
              code: '1124',
              display: 'Other',
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
          text: 'Other',
        },
      ],
      period: {
        start: '2020-10-21T16:25:00.000Z',
      },
      individual: {
        reference: 'Practitioner/12742566',
        display: 'McGinn, Aaron',
      },
    },
    {
      type: [
        {
          coding: [
            {
              system:
                'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/333',
              code: '1126',
              display: 'Referring Physician',
              userSelected: true,
            },
            {
              system:
                'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
              code: 'REF',
              display: 'referrer',
              userSelected: false,
            },
          ],
          text: 'Referring Physician',
        },
      ],
      period: {
        start: '2019-12-26T15:41:55.000Z',
      },
      individual: {
        reference: 'Practitioner/4122622',
        display: 'Cerner Test, Physician - Hospitalist Cerner',
      },
    },
    {
      type: [
        {
          coding: [
            {
              system:
                'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/333',
              code: '18883355',
              display: 'Covering Physician',
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
          text: 'Covering Physician',
        },
      ],
      period: {
        start: '2021-07-29T17:41:00.000Z',
      },
      individual: {
        reference: 'Practitioner/12747925',
        display: 'PWASHA, MD, Cardio',
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
        start: '2021-07-15T14:18:37.000Z',
      },
      individual: {
        reference: 'Practitioner/12749840',
        display: 'PWHealthNote, MD, Cardio',
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
        start: '2021-06-09T23:58:00.000Z',
      },
      individual: {
        reference: 'Practitioner/12754834',
        display: 'PWPrecise, MD, Cardio',
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
        start: '2021-04-23T14:36:00.000Z',
      },
      individual: {
        reference: 'Practitioner/12747925',
        display: 'PWASHA, MD, Cardio',
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
        start: '2021-04-22T20:02:26.000Z',
      },
      individual: {
        reference: 'Practitioner/12747925',
        display: 'PWASHA, MD, Cardio',
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
        start: '2021-04-07T14:09:15.000Z',
      },
      individual: {
        reference: 'Practitioner/12747925',
        display: 'PWASHA, MD, Cardio',
      },
    },
    {
      type: [
        {
          coding: [
            {
              system:
                'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/333',
              code: '18883355',
              display: 'Covering Physician',
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
          text: 'Covering Physician',
        },
      ],
      period: {
        start: '2021-04-05T19:09:31.000Z',
      },
      individual: {
        reference: 'Practitioner/12747925',
        display: 'PWASHA, MD, Cardio',
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
        start: '2021-03-18T13:47:00.000Z',
      },
      individual: {
        reference: 'Practitioner/12736052',
        display: 'Scott, Justin',
      },
    },
    {
      type: [
        {
          coding: [
            {
              system:
                'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/333',
              code: '18883355',
              display: 'Covering Physician',
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
          text: 'Covering Physician',
        },
      ],
      period: {
        start: '2021-03-13T20:52:00.000Z',
      },
      individual: {
        reference: 'Practitioner/12747925',
        display: 'PWASHA, MD, Cardio',
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
        start: '2021-03-03T21:23:00.000Z',
      },
      individual: {
        reference: 'Practitioner/12747925',
        display: 'PWASHA, MD, Cardio',
      },
    },
    {
      type: [
        {
          coding: [
            {
              system:
                'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/333',
              code: '18883355',
              display: 'Covering Physician',
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
          text: 'Covering Physician',
        },
      ],
      period: {
        start: '2021-03-02T21:29:00.000Z',
      },
      individual: {
        reference: 'Practitioner/12747925',
        display: 'PWASHA, MD, Cardio',
      },
    },
    {
      type: [
        {
          coding: [
            {
              system:
                'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/333',
              code: '18883355',
              display: 'Covering Physician',
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
          text: 'Covering Physician',
        },
      ],
      period: {
        start: '2021-01-15T10:49:00.000Z',
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
              code: '20384266',
              display: 'Peer Review',
              userSelected: true,
            },
          ],
          text: 'Peer Review',
        },
      ],
      period: {
        start: '2021-01-13T19:13:54.000Z',
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
              code: '18883355',
              display: 'Covering Physician',
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
          text: 'Covering Physician',
        },
      ],
      period: {
        start: '2020-12-18T02:19:55.000Z',
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
              code: '155333025',
              display: 'Utilization Review',
              userSelected: true,
            },
          ],
          text: 'Utilization Review',
        },
      ],
      period: {
        start: '2020-12-17T17:09:21.000Z',
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
              code: '4199435',
              display: 'Pathologist',
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
          text: 'Pathologist',
        },
      ],
      period: {
        start: '2020-11-26T11:13:45.000Z',
      },
      individual: {
        reference: 'Practitioner/12744694',
        display: 'PWDentrix, Pathologist',
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
        start: '2020-09-02T19:25:00.000Z',
      },
      individual: {
        reference: 'Practitioner/12742577',
        display: 'MedActionPlanRN, PW',
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
        start: '2020-08-28T16:54:00.000Z',
        end: '2020-08-29T05:01:33.000Z',
      },
      individual: {
        reference: 'Practitioner/12724045',
        display: 'Graham, Joshua',
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
        start: '2020-08-27T23:17:45.000Z',
        end: '2020-08-28T12:01:17.000Z',
      },
      individual: {
        reference: 'Practitioner/12742070',
        display: 'Kheang, Kol',
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
        start: '2020-08-10T13:11:56.000Z',
        end: '2020-08-11T02:01:29.000Z',
      },
      individual: {
        reference: 'Practitioner/12742742',
        display: 'Mehra, Rajneesh',
      },
    },
    {
      type: [
        {
          coding: [
            {
              system:
                'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/333',
              code: '18883355',
              display: 'Covering Physician',
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
          text: 'Covering Physician',
        },
      ],
      period: {
        start: '2020-01-31T20:34:00.000Z',
        end: '2020-01-31T21:01:21.000Z',
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
              code: '18883355',
              display: 'Covering Physician',
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
          text: 'Covering Physician',
        },
      ],
      period: {
        start: '2019-12-26T19:05:12.000Z',
        end: '2020-01-17T06:01:53.000Z',
      },
      individual: {
        reference: 'Practitioner/12724045',
        display: 'Graham, Joshua',
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
        start: '2020-09-18T17:29:00.000Z',
      },
      individual: {
        reference: 'Practitioner/12742563',
        display: 'Pivonka, Fran',
      },
    },
  ],
  period: {
    start: '2015-09-01T00:00:00.000Z',
    end: '2021-02-17T21:15:00.000Z',
  },
  reasonCode: [
    {
      text: 'Illness',
    },
  ],
  hospitalization: {
    admitSource: {
      coding: [
        {
          system:
            'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/2',
          code: '4326381',
          display: 'Self (Non-HC Facility Source of Origin)',
          userSelected: true,
        },
        {
          system: 'http://terminology.hl7.org/CodeSystem/admit-source',
          code: 'other',
          display: 'Other',
          userSelected: false,
        },
      ],
      text: 'Self (Non-HC Facility Source of Origin)',
    },
  },
  location: [
    {
      location: {
        reference: 'Location/32545019',
        display: 'Model Hospital, MX Hospital, NU05, 102, A',
      },
      status: 'completed',
    },
  ],
  serviceProvider: {
    reference: 'Organization/675844',
    display: 'Model Hospital',
  },
} satisfies EncounterReadResponseType
