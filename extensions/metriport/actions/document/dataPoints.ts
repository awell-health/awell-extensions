import { type DataPointDefinition } from '../../../../lib/types'

export const documentsDataPoints = {
  queryStatus: {
    key: 'queryStatus',
    valueType: 'string',
  },
  queryProgressTotal: {
    key: 'queryProgressTotal',
    valueType: 'number',
  },
  queryProgressComplete: {
    key: 'queryProgressComplete',
    valueType: 'number',
  },
} satisfies Record<string, DataPointDefinition>

export const documentUrlPoints = {
  url: {
    key: 'url',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
