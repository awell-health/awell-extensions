import { type AppointmentReadResponseType } from '../../../lib/api/FhirR4/schema'

export const GetAppointmentMockResponse = {
  resourceType: 'Appointment',
  id: '4822366',
  meta: {
    versionId: '2',
    lastUpdated: '2021-04-22T12:21:26Z',
  },
  text: {
    status: 'generated',
    div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Appointment</b></p><p><b>Status</b>: Cancelled</p><p><b>Service Type</b>: Surgery Rapid</p><p><b>Start</b>: Jan 23, 2020 10:10 P.M. UTC</p><p><b>End</b>: Jan 23, 2020 11:10 P.M. UTC</p><p><b>Participants</b>:</p><dl><dd><b>Location</b>: Endoscopy</dd><dd><b>Other Resource</b>: EN Add-On</dd><dd><b>Patient</b>: SMARTS Sr., NANCYS II</dd></dl></div>',
  },
  extension: [
    {
      valueBoolean: false,
      url: 'https://fhir-ehr.cerner.com/r4/StructureDefinition/is-cancelable',
    },
    {
      valueBoolean: false,
      url: 'https://fhir-ehr.cerner.com/r4/StructureDefinition/is-reschedulable',
    },
  ],
  status: 'cancelled',
  cancelationReason: {
    coding: [
      {
        system:
          'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/14229',
        code: '0',
        userSelected: true,
      },
    ],
  },
  serviceType: [
    {
      coding: [
        {
          system:
            'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/14249',
          code: '4047611',
          display: 'Surgery Rapid',
          userSelected: true,
        },
        {
          system: 'http://snomed.info/sct',
          code: '394576009',
          display: 'Accident & emergency (qualifier value)',
          userSelected: false,
        },
      ],
      text: 'Surgery Rapid',
    },
  ],
  reasonCode: [
    {
      text: 'I have a cramp',
    },
  ],
  description: 'Surgery Rapid',
  start: '2020-01-23T22:10:00Z',
  end: '2020-01-23T23:10:00Z',
  minutesDuration: 60,
  participant: [
    {
      actor: {
        reference: 'Location/32216049',
        display: 'Endoscopy',
      },
      required: 'required',
      status: 'accepted',
    },
    {
      type: [
        {
          coding: [
            {
              system:
                'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/14250',
              code: '269829903',
              display: 'Endoscopy Rooms',
              userSelected: true,
            },
          ],
          text: 'Endoscopy Rooms',
        },
        {
          coding: [
            {
              system:
                'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
              code: 'PPRF',
              display: 'primary performer',
            },
          ],
        },
      ],
      actor: {
        display: 'EN Add-On',
      },
      required: 'required',
      status: 'accepted',
    },
    {
      type: [
        {
          coding: [
            {
              system:
                'https://fhir.cerner.com/ec2458f2-1e24-41c8-b71b-0e701af7583d/codeSet/14250',
              code: '4572',
              display: 'Patient',
              userSelected: true,
            },
          ],
          text: 'Patient',
        },
      ],
      actor: {
        reference: 'Patient/12724066',
        display: 'SMARTS Sr., NANCYS II',
      },
      required: 'required',
      status: 'accepted',
      period: {
        start: '2020-01-23T22:10:00Z',
        end: '2020-01-23T23:10:00Z',
      },
    },
  ],
  requestedPeriod: [
    {
      start: '2020-01-23T22:10:00Z',
      end: '2020-01-23T23:10:00Z',
    },
  ],
} satisfies AppointmentReadResponseType
