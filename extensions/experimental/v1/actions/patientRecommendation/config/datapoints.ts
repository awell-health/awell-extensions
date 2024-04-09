import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  acceptRecommendation: {
    key: 'acceptRecommendation',
    valueType: 'boolean',
  },
} satisfies Record<string, DataPointDefinition>
