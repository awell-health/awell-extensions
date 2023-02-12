import { log } from './actions'
import { type ActivityPlugin } from '../../lib/types'

export const HelloWorld: ActivityPlugin = {
  key: 'hello-world',
  category: 'demo',
  title: 'Hello World !',
  settings: {},
  actions: {
    log,
  },
}
