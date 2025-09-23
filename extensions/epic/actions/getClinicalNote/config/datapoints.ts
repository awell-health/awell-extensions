import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  documentReference: {
    key: 'documentReference',
    valueType: 'json',
  },
  binaryContentHtml: {
    key: 'binaryContentHtml',
    valueType: 'string',
  },
  binaryContentRtf: {
    key: 'binaryContentRtf',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
