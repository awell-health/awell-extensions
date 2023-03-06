import { log } from './actions'
import { type ActionExtension } from '../../lib/types'
import { settings } from './settings'

export const HelloWorld: ActionExtension = {
  key: 'hello-world',
  category: 'demo',
  title: 'Hello World !',
  settings,
  actions: {
    log,
  },
}
