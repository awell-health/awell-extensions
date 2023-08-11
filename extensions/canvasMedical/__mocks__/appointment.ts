import type {
  AppointmentWithId,
  Appointment,
} from '../validation/dto/appointment.zod'

export const appointmentData: Appointment = {
  resourceType: 'Appointment',
  reasonCode: [
    {
      coding: [{ system: 'INTERNAL', code: '9903', display: 'Urgent Visit' }],
      text: 'Weekly check-in',
    },
  ],
  participant: [
    {
      actor: {
        reference: 'Practitioner/dbf184ad28a1408bbed184fc8fd2b029',
      },
      status: 'accepted',
    },
    {
      actor: {
        reference: 'Patient/5350cd20de8a470aa570a852859ac87e',
      },
      status: 'accepted',
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
  start: '2022-03-20T13:30:00.000Z',
  end: '2022-03-20T14:00:00.000Z',
  supportingInformation: [
    {
      reference: 'Location/1',
    },
    {
      reference: '#appointment-meeting-endpoint',
      type: 'Endpoint',
    },
  ],
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
}

export const appointmentResource: AppointmentWithId = {
  id: '31365726-b823-4353-8c91-5d4f59d67ed3',
  ...appointmentData,
}
