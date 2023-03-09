import { type Field, FieldType, type Action } from '../../../lib/types'
import { type settings } from '../settings'

const fields = {
  text: {
    id: 'text',
    label: 'Message',
    description: 'A text field configured at design time',
    type: FieldType.TEXT,
  },
} satisfies Record<string, Field>

export const log: Action<typeof fields, typeof settings> = {
  key: 'log',
  category: 'demo',
  title: 'Log hello world',
  fields,
  previewable: true,
  onActivityCreated: async (payload, onComplete): Promise<void> => {
    const { activity, fields, settings } = payload
    console.log('Hello world!', { activity, fields, settings })
    await onComplete()
  },
}
