import { type GetBookingResponseType } from '../../../../lib/api/v2/schema'
import { type AxiosResponse } from 'axios'

export const getBookingMockResponse = {
  status: 200,
  data: {
    status: 'success',
    data: {
      id: 123,
      uid: 'booking_uid_123',
      title: 'Consultation',
      description: 'Learn how to integrate scheduling into marketplace.',
      hosts: [
        {
          id: 1,
          name: 'Jane Doe',
          email: 'jane100@example.com',
          username: 'jane100',
          timeZone: 'America/Los_Angeles',
        },
      ],
      status: 'accepted',
      cancellationReason: 'User requested cancellation',
      cancelledByEmail: 'canceller@example.com',
      reschedulingReason: 'User rescheduled the event',
      rescheduledByEmail: 'rescheduler@example.com',
      rescheduledFromUid: 'previous_uid_123',
      start: '2024-08-13T15:30:00Z',
      end: '2024-08-13T16:30:00Z',
      duration: 60,
      eventType: {
        id: 1,
        slug: 'some-event',
      },
      location: 'https://example.com/meeting',
      absentHost: true,
      createdAt: '2024-08-13T15:30:00Z',
      updatedAt: '2024-08-13T15:30:00Z',
      metadata: {
        key: 'value',
      },
      rating: 4,
      icsUid: 'ics_uid_123',
      attendees: [
        {
          name: 'John Doe',
          email: 'john.doe@example.com',
          timeZone: 'America/New_York',
          phoneNumber: '+919876543210',
          language: 'it',
        },
      ],
      guests: ['guest1@example.com', 'guest2@example.com'],
      bookingFieldsResponses: {
        customField: 'customValue',
      },
    },
    error: {},
  },
} satisfies Partial<AxiosResponse<GetBookingResponseType>>
