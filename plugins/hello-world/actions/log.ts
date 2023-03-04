import {
  type PluginActionField,
  PluginActionFieldType,
  type PluginAction,
} from '../../../lib/types'
import { type settings } from '../settings'

const fields = {
  text: {
    id: 'text',
    label: 'Message',
    description: 'A text field configured at design time',
    type: PluginActionFieldType.TEXT,
  },
} satisfies Record<string, PluginActionField>

export const log: PluginAction<typeof fields, typeof settings> = {
  key: 'log',
  category: 'demo',
  title: 'Log hello world',
  fields,
  previewable: true,
  onActivityCreated: async (payload, done): Promise<void> => {
    const { activity, fields, settings } = payload
    console.log('Hello world!', { activity, fields, settings })
    await done()
  },
}
