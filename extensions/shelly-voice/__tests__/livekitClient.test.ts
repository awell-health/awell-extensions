import { createAgent, startAgent, stopAgent } from '../lib/livekitClient'

describe('livekitClient wrapper', () => {
  it('should create agent with config and return agentId, persisting JTBD fields', async () => {
    const { agentId, config } = await createAgent({
      voice: 'alloy',
      language: 'en',
      personality: 'friendly',
      jobToBeDone: 'Intake call',
      patientContext: 'Age 67, prefers Spanish, CHF',
      careSetting: 'outpatient',
      complianceNotes: 'Consent recorded',
    })
    expect(agentId).toBeTruthy()
    expect(config.voice).toBe('alloy')
    expect(config.language).toBe('en')
    expect(config.personality).toBe('friendly')
    expect(config.jobToBeDone).toBe('Intake call')
    expect(config.patientContext).toContain('Spanish')
    expect(config.careSetting).toBe('outpatient')
    expect(config.complianceNotes).toBe('Consent recorded')
  })

  it('should start and stop session', async () => {
    const { agentId } = await createAgent({
      voice: 'verse',
      language: 'es',
      personality: 'calm',
    })
    const settings = {
      livekitServerUrl: 'wss://fake',
      livekitApiKey: 'key',
      livekitApiSecret: 'secret',
    }
    const start = await startAgent(settings, agentId, { sessionContext: { source: 'test' } })
    expect(start.sessionId).toBeTruthy()
    expect(start.status).toBe('running')

    const stop = await stopAgent(settings, agentId)
    expect(stop.status).toBe('stopped')
  })
})
