import { type DataPointDefinition } from '@awell-health/extensions-core'

export const documentsDataPoints = {
  documents: {
    key: 'documents',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>

export const documentUrlPoints = {
  url: {
    key: 'url',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const documentQueryDataPoints = {
  downloadStatus: {
    key: 'downloadStatus',
    valueType: 'string',
  },
  downloadTotal: {
    key: 'downloadTotal',
    valueType: 'number',
  },
  downloadSuccessful: {
    key: 'downloadSuccessful',
    valueType: 'number',
  },
  requestId: {
    key: 'requestId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
