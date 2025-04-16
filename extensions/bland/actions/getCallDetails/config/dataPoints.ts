import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  callData: {
    key: 'callData',
    valueType: 'json',
  },
  callLength: {
    key: 'callLength',
    valueType: 'number',
  },
  to: {
    key: 'to',
    valueType: 'telephone',
  },
  from: {
    key: 'from',
    valueType: 'telephone',
  },
  completed: {
    key: 'completed',
    valueType: 'boolean',
  },
  metadata: {
    key: 'metadata',
    valueType: 'json',
  },
  summary: {
    key: 'summary',
    valueType: 'string',
  },
  startedAt: {
    key: 'startedAt',
    valueType: 'date',
  },
  endAt: {
    key: 'endAt',
    valueType: 'date',
  },
  analysisSchema: {
    key: 'analysisSchema',
    valueType: 'json',
  },
  analysis: {
    key: 'analysis',
    valueType: 'json',
  },
  concatenatedTranscript: {
    key: 'concatenatedTranscript',
    valueType: 'string',
  },
  transcripts: {
    key: 'transcripts',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>
