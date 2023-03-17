import {
  FieldType,
  type Action,
  type DataPointDefinition,
  type Field,
} from '../../../lib/types'
import { Category } from '../../../lib/types/marketplace'
import { type settings } from '../settings'

const fields = {
  hello: {
    id: 'hello',
    label: 'Hello',
    description: 'A string field configured at design time',
    type: FieldType.STRING,
  },
} satisfies Record<string, Field>

const dataPoints = {
  world: {
    key: 'world',
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
    const { fields } = payload
    await onComplete({
      data_points: {
        world: fields.hello,
      },
    })
  },
}
