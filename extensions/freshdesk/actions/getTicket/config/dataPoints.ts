import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  ticketData: {
    key: 'ticketData',
    valueType: 'json',
  },
  subject: {
    key: 'subject',
    valueType: 'string',
  },
  type: {
    key: 'type',
    valueType: 'string',
  },
  priorityValue: {
    key: 'priorityValue',
    valueType: 'number',
  },
  priorityLabel: {
    key: 'priorityLabel',
    valueType: 'string',
  },
  statusValue: {
    key: 'statusValue',
    valueType: 'number',
  },
  statusLabel: {
    key: 'statusLabel',
    valueType: 'string',
  },
  sourceValue: {
    key: 'sourceValue',
    valueType: 'number',
  },
  sourceLabel: {
    key: 'sourceLabel',
    valueType: 'string',
  },
  descriptionText: {
    key: 'descriptionText',
    valueType: 'string',
  },
  descriptionHtml: {
    key: 'descriptionHtml',
    valueType: 'string',
  },
  customFields: {
    key: 'customFields',
    valueType: 'json',
  },
  tags: {
    key: 'tags',
    valueType: 'strings_array',
  },
} satisfies Record<string, DataPointDefinition>
