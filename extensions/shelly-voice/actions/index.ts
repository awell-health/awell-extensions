import { createAgentAction } from './createAgent'
import { startAgentAction } from './startAgent'
import { stopAgentAction } from './stopAgent'

export const actions = {
  createAgent: createAgentAction,
  startAgent: startAgentAction,
  stopAgent: stopAgentAction,
}
