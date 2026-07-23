import { type DataPointDefinition } from '@awell-health/extensions-core'

export const removePatientFromCohortDataPoints = {
  message: {
    key: 'message',
    valueType: 'string',
  },
  cohort: {
    key: 'cohort',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>
