import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  summary: {
    key: 'summary',
    valueType: 'string',
  },
  observationsSummaryFormatted: {
    key: 'observationsSummaryFormatted',
    valueType: 'string',
  },
  followupFormatted: {
    key: 'followupFormatted',
    valueType: 'string',
  },
  observations: {
    key: 'observations',
    valueType: 'json',
  },
  sourceId: {
    key: 'sourceId',
    valueType: 'string',
  },
  processedAt: {
    key: 'processedAt',
    valueType: 'string',
  },
  processingTimeMs: {
    key: 'processingTimeMs',
    valueType: 'number',
  },
  promptVersion: {
    key: 'promptVersion',
    valueType: 'number',
  },
  totalTokens: {
    key: 'totalTokens',
    valueType: 'number',
  },
  estimatedCost: {
    key: 'estimatedCost',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>
