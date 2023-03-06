import {
  type ExtensionActionField,
  ExtensionActionFieldType,
  type ExtensionAction,
} from '../../../lib/types'
import { type settings } from '../settings'

const fields = {
  text: {
    id: 'text',
    label: 'Message',
    description: 'A text field configured at design time',
    type: ExtensionActionFieldType.TEXT,
  },
} satisfies Record<string, ExtensionActionField>

export const log: ExtensionAction<typeof fields, typeof settings> = {
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
