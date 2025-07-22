import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  base64EncodedFax: {
    key: 'base64EncodedFax',
    valueType: 'string',
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
