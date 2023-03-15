import {
  type Field,
  FieldType,
  type Action,
  type DataPointDefinition,
} from '../../../lib/types'
import { type settings } from '../settings'

const fields = {
  text: {
    id: 'text',
    label: 'Message',
    description: 'A text field configured at design time',
    type: FieldType.TEXT,
  },
} satisfies Record<string, Field>

const dataPoints = {
  hello: {
    key: 'hello',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const log: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'log',
  category: 'demo',
  title: 'Log hello world',
  description: 'This is a dummy Custom Action for extension developers.',
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete): Promise<void> => {
    const { activity, fields, settings } = payload
    console.log('Hello world!', { activity, fields, settings })
    await onComplete({
      data_points: {
        hello: 'world',
      },
    })
  },
}
