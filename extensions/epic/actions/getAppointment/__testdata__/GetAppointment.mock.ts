import { type AxiosResponse } from 'axios'

export const GetAppointmentMockResponse = {
  status: 200,
  statusText: 'OK',
  data: {
    resourceType: 'Appointment',
    id: 'f1OEwaU.E66RGJ3CLbejHKg4',
    identifier: [
      {
        system: 'urn:oid:1.2.840.114350.1.13.0.1.7.3.698084.8',
        value: '27717',
      },
    ],
    status: 'booked',
    serviceCategory: [
      {
        coding: [
          {
            system:
              'http://open.epic.com/FHIR/StructureDefinition/appointment-service-category',
            code: 'appointment',
            display: 'Appointment',
          },
        ],
        text: 'appointment',
      },
    ],
    serviceType: [
      {
        coding: [
          {
            system: 'urn:oid:1.2.840.114350.1.13.0.1.7.2.808267',
            code: '1004',
            display: 'Office Visit',
          },
        ],
      },
    ],
    appointmentType: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: 'AMB',
          display: 'Ambulatory',
        },
      ],
    },
    start: '2020-11-20T16:45:00Z',
    end: '2020-11-20T17:00:00Z',
    minutesDuration: 15,
    created: '2020-11-19',
    patientInstruction:
      'Please bring any insurance information and a copayment if required by your insurance company.',
    participant: [
      {
        actor: {
          reference: 'Patient/eXbMln3hu0PfFrpv2HgVHyg3',
          display: 'Picard, Jean-Luc',
        },
        required: 'required',
        status: 'accepted',
        period: {
          start: '2020-11-20T16:45:00Z',
          end: '2020-11-20T17:00:00Z',
        },
      },
      {
        actor: {
          reference: 'Practitioner/ecVOweFjbhIxnosTWzhf02g3',
          display: 'Beverly Crusher',
        },
        required: 'required',
        status: 'accepted',
        period: {
          start: '2020-11-20T16:45:00Z',
          end: '2020-11-20T17:00:00Z',
        },
      },
      {
        actor: {
          reference: 'Location/e4W4rmGe9QzuGm2Dy4NBqVc0KDe6yGld6HW95UuN-Qd03',
          display: 'EMC Family Medicine',
        },
        required: 'required',
        status: 'accepted',
        period: {
          start: '2020-11-20T16:45:00Z',
          end: '2020-11-20T17:00:00Z',
        },
      },
    ],
  },
} satisfies Partial<AxiosResponse>
