import { type Appointment } from '@medplum/fhirtypes'

export const mockAppointmentResponse: Appointment = {
  id: '3e471b29-eec4-47e0-86f1-cec848658417',
  resourceType: 'Appointment',
  identifier: [
    {
      system: 'test',
      value: 'hello',
    },
  ],
  status: 'booked',
  serviceCategory: [
    {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/service-category',
          code: '1',
          display: 'Adoption',
        },
      ],
    },
  ],
  serviceType: [
    {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/service-type',
          code: '1',
          display: 'Adoption/Permanent Care Info/Support',
        },
      ],
    },
  ],
  specialty: [
    {
      coding: [
        {
          system: 'http://snomed.info/sct',
          code: '394579002',
          display: 'Cardiology',
        },
      ],
    },
  ],
  appointmentType: {
    coding: [
      {
        system: 'http://terminology.hl7.org/CodeSystem/v2-0276',
        code: 'EMERGENCY',
        display: 'Emergency appointment',
      },
    ],
  },
  reasonReference: [],
  priority: 1,
  description: 'A description',
  start: '2024-04-30T07:00:00.000Z',
  end: '2024-04-30T08:00:00.000Z',
  minutesDuration: 52,
  slot: [],
  participant: [
    {
      status: 'accepted',
      type: [
        {
          coding: [
            {
              system:
                'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
              code: 'ATND',
              display: 'attender',
            },
          ],
        },
      ],
    },
  ],
  meta: {
    versionId: '66a2e727-6b9c-4c74-ae58-56066613daa8',
    lastUpdated: '2024-04-30T07:34:11.590Z',
    author: {
      reference: 'Practitioner/44af435c-38aa-464c-9b68-d0f4f103d8be',
      display: 'Nick Hellemans',
    },
    project: 'a9b24c66-fb3f-4162-b94c-cb84e20311e5',
    compartment: [
      {
        reference: 'Project/a9b24c66-fb3f-4162-b94c-cb84e20311e5',
      },
    ],
  },
}
