import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  sendbirdId: {
    key: 'sendbirdId',
    valueType: 'string',
  },
  channelType: {
    key: 'channelType',
    valueType: 'string',
  },
  project: {
    key: 'project',
    valueType: 'number',
  },
  createdAt: {
    key: 'createdAt',
    valueType: 'date',
  },
  displayName: {
    key: 'displayName',
    valueType: 'string',
  },
  customFields: {
    key: 'customFields',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>
