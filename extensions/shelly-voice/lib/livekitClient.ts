import { randomUUID } from 'crypto'

type AgentConfig = {
  voice: string
  language: string
  personality: string
}

type Settings = {
  livekitServerUrl: string
  livekitApiKey: string
  livekitApiSecret: string
}

type StartContext = {
  pathwayId?: string
  activityId?: string
  patientId?: string
  sessionContext?: Record<string, unknown>
}

const agents = new Map<string, AgentConfig>()
const sessions = new Map<string, { agentId: string; status: 'running' | 'stopped'; startedAt?: string; stoppedAt?: string }>()

export const createAgent = async (config: AgentConfig) => {
  const agentId = randomUUID()
  agents.set(agentId, config)
  return { agentId, config }
}

export const startAgent = async (settings: Settings, agentId: string, context: StartContext) => {
  if (!agents.has(agentId)) {
    throw new Error('Agent not found')
  }
  const sessionId = randomUUID()
  sessions.set(sessionId, { agentId, status: 'running', startedAt: new Date().toISOString() })
  return { sessionId, status: 'running', context }
}

export const stopAgent = async (settings: Settings, agentId: string) => {
  for (const [sessionId, s] of sessions.entries()) {
    if (s.agentId === agentId && s.status === 'running') {
      s.status = 'stopped'
      s.stoppedAt = new Date().toISOString()
      sessions.set(sessionId, s)
    }
  }
  return { status: 'stopped' }
}
