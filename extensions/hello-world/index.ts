import { log } from './actions'
import { type CustomActionExtension } from '../../lib/types'
import { settings } from './settings'

export const HelloWorld: CustomActionExtension = {
  key: 'hello-world',
  category: 'demo',
  title: 'Hello World !',
  settings,
  actions: {
    log,
  },
}
