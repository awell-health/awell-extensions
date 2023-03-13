import { randomInteger } from './actions'
import { type Extension } from '../../lib/types'
import { settings } from './settings'

export const MathExtension: Extension = {
  key: 'math',
  category: 'demo',
  title: 'Hello World !',
  settings,
  actions: {
    randomInteger,
  },
}
