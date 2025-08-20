import { createAgent, startAgent, stopAgent } from '../lib/livekitClient'

describe('livekit wrapper', () => {
  it('creates agent and returns id', async () => {
    const r = await createAgent({ voice: 'alice', language: 'en', personality: 'friendly' })
    expect(r.agentId).toBeDefined()
    expect(r.config.voice).toBe('alice')
  })

  it('starts and stops agent', async () => {
    const r = await createAgent({ voice: 'bob', language: 'en', personality: 'calm' })
    const s = await startAgent(
      { livekitServerUrl: 'http://localhost', livekitApiKey: 'k', livekitApiSecret: 's' },
      r.agentId,
      {}
    )
    expect(s.sessionId).toBeDefined()
    expect(s.status).toBe('running')
    const st = await stopAgent(
      { livekitServerUrl: 'http://localhost', livekitApiKey: 'k', livekitApiSecret: 's' },
      r.agentId
    )
    expect(st.status).toBe('stopped')
  })
})
