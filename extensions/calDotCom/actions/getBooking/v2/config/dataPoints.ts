import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  bookingData: {
    key: 'bookingData',
    valueType: 'json',
  },
  eventTypeId: {
    key: 'eventTypeId',
    valueType: 'string',
  },
  title: {
    key: 'title',
    valueType: 'string',
  },
  description: {
    key: 'description',
    valueType: 'string',
  },
  startTime: {
    key: 'startTime',
    valueType: 'date',
  },
  endTime: {
    key: 'endTime',
    valueType: 'date',
  },
  status: {
    key: 'status',
    valueType: 'string',
  },
  cancelUrl: {
    key: 'cancelUrl',
    valueType: 'string',
  },
  rescheduleUrl: {
    key: 'rescheduleUrl',
    valueType: 'string',
  },
  firstAttendeeEmail: {
    key: 'firstAttendeeEmail',
    valueType: 'string',
  },
  firstAttendeeTimezone: {
    key: 'firstAttendeeTimezone',
    valueType: 'string',
  },
  firstAttendeeName: {
    key: 'firstAttendeeName',
    valueType: 'string',
  },
  hostEmail: {
    key: 'hostEmail',
    valueType: 'string',
  },
  location: {
    key: 'location',
    valueType: 'string',
  },
  bookingFieldsResponses: {
    key: 'bookingFieldsResponses',
    valueType: 'json',
  },
  metadata: {
    key: 'metadata',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>
