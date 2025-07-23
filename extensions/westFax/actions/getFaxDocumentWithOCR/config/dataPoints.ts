import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  /**
   * Westfax returns a base64 encoded pdf file and there's no data point value type we can store it in
   * Storing it in a string is forbidden as it is too large and has risks attached to it
   */
  // base64EncodedFax: {
  //   key: 'base64EncodedFax',
  //   valueType: 'string',
  // },
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
