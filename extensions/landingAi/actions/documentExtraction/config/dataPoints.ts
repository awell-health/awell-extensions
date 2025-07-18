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
} satisfies Record<string, DataPointDefinition>
