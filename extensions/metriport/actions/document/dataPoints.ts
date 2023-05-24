import { type DataPointDefinition } from '../../../../lib/types'

export const documentsDataPoints = {
  queryStatus: {
    key: 'queryStatus',
    valueType: 'string',
  },
  queryProgressTotal: {
    key: 'queryProgressTotal',
    valueType: 'string',
  },
  queryProgressComplete: {
    key: 'queryProgressComplete',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const documentUrlPoints = {
  url: {
    key: 'url',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
