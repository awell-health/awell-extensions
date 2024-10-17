import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
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
  userEmail: {
    key: 'userEmail',
    valueType: 'string',
  },
  location: {
    key: 'location',
    valueType: 'string',
  },
  // Note: This data point can indeed have a null value in response to a 200, as opposed to other data points that will hold a definite value. If the user intends to utilize this value, they can verify if it's empty and/or opt to use a fallback value in a dynamic variable.
  videoCallUrl: {
    key: 'videoCallUrl',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
