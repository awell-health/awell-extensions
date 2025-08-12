import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  markdown: {
    key: 'markdown',
    valueType: 'string',
  },
  chunks: {
    key: 'chunks',
    valueType: 'json',
  },
  extractedDataBasedOnSchema: {
    key: 'extractedDataBasedOnSchema',
    valueType: 'json',
  },
  extractedMetadata: {
    key: 'extractedMetadata',
    valueType: 'json',
  },
  direction: {
    key: 'direction',
    valueType: 'string',
  },
  date: {
    key: 'date',
    valueType: 'date',
  },
  status: {
    key: 'status',
    valueType: 'string',
  },
  format: {
    key: 'format',
    valueType: 'string',
  },
  pageCount: {
    key: 'pageCount',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>
