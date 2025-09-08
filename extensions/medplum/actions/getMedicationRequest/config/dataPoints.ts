import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  medicationRequest: {
    key: 'medicationRequest',
    valueType: 'json',
  },
  status: {
    key: 'status',
    valueType: 'string',
  },
  intent: {
    key: 'intent',
    valueType: 'string',
  },
  priority: {
    key: 'priority',
    valueType: 'string',
  },
  medicationDisplay: {
    key: 'medicationDisplay',
    valueType: 'string',
  },
  dosageInstructions: {
    key: 'dosageInstructions',
    valueType: 'string',
  },
  patientId: {
    key: 'patientId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
