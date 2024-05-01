import {
  type Field,
  type Action,
  type DataPointDefinition,
  FieldType,
  JsonSchemaSourceSystem,
} from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category } from '@awell-health/extensions-core'

export const dataPoints = {
  object: {
    key: 'object',
    valueType: 'json',
    jsonSchemaSource: {
      system: JsonSchemaSourceSystem.EXTENSION,
      key: 'example',
    },
  },
} satisfies Record<string, DataPointDefinition<'example'>>

const fields = {
  array: {
    id: 'array',
    label: 'Send array instead of object',
    type: FieldType.BOOLEAN,
    required: false,
  },
} satisfies Record<string, Field>

export const returnObject: Action<typeof fields, typeof settings> = {
  key: 'returnObject',
  category: Category.WORKFLOW,
  title: 'Return object',
  description: 'Return an object to be stored as a datapoint',
  fields,
  dataPoints,
  previewable: false,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const mockObject = {
      message: 'Hello World',
      number: 123,
      array: [1, 2, 3],
      nested: { key: 'value' },
      boolean: true,
    }
    if (payload.fields.array === true) {
      await onComplete({
        data_points: {
          object: JSON.stringify([mockObject]),
        },
      })
    } else {
      await onComplete({
        data_points: {
          object: JSON.stringify(mockObject),
        },
      })
    }
  },
}
