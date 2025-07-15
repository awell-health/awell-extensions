import { type DataPointDefinition } from '@awell-health/extensions-core'

export const dataPoints = {
  contactData: {
    key: 'contactData',
    valueType: 'json',
  },
  name: {
    key: 'name',
    valueType: 'string',
  },
  email: {
    key: 'email',
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
