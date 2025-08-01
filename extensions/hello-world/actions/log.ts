import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Field,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../settings'

const fields = {
  hello: {
    id: 'hello',
    label: 'Hello',
    description: 'A string field configured at design time',
    type: FieldType.STRING,
  },
  secondField: {
    id: 'secondField',
    label: 'Second Field',
    description: 'A second field',
    required: false,
    type: FieldType.TEXT,
  },
} satisfies Record<string, Field>

const dataPoints = {
  world: {
    key: 'world',
    valueType: 'string',
  },
  clear: {
    key: 'clear',
    valueType: 'string',
  },
  secret: {
    key: 'secret',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const log: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'log',
  category: Category.DEMO,
  title: 'Log hello world',
  description: 'This is a dummy Custom Action for extension developers.',
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete): Promise<void> => {
    const { fields, settings } = payload
    await onComplete({
      data_points: {
        world: fields.hello,
        clear: settings.clear,
        secret: settings.secret,
      },
    })
  },
}
