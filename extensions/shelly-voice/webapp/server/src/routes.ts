import express from 'express'
import type { Request, Response } from 'express'
import fetch from 'node-fetch'
import { env } from './env'
import { addEvent, eventLog } from './store'
import { createAgent, startAgent, stopAgent } from '../../../lib/livekitClient'

export const router = express.Router()

router.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true })
})

router.get('/events', (_req: Request, res: Response) => {
  res.json({ events: eventLog })
})

router.post('/agents', async (req: Request, res: Response) => {
  const { voice, language, personality, jobToBeDone, patientContext, careSetting, complianceNotes } = req.body || {}
  try {
    const result = await createAgent({ voice, language, personality, jobToBeDone, patientContext, careSetting, complianceNotes })
    addEvent('agent.created', { agentId: result.agentId, config: result.config })
    res.json(result)
  } catch (e: any) {
    addEvent('agent.create.error', { error: e?.message || 'Unknown error', input: { voice, language, personality, jobToBeDone, patientContext, careSetting, complianceNotes } })
    res.status(400).json({ error: e?.message || 'Failed to create agent' })
  }
})

router.post('/agents/:id/start', async (req: Request, res: Response) => {
  const { id } = req.params
  const sessionContext = req.body?.sessionContext || {}
  try {
    const result = await startAgent(
      {
        livekitServerUrl: env.LIVEKIT_URL,
        livekitApiKey: env.LIVEKIT_API_KEY,
        livekitApiSecret: env.LIVEKIT_API_SECRET,
      },
      id,
      {
        sessionContext,
      }
    )
    addEvent('agent.started', { agentId: id, sessionId: result.sessionId })
    res.json(result)
  } catch (e: any) {
    res.status(400).json({ error: e.message })
  }
})

router.post('/agents/:id/stop', async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const result = await stopAgent(
      {
        livekitServerUrl: env.LIVEKIT_URL,
        livekitApiKey: env.LIVEKIT_API_KEY,
        livekitApiSecret: env.LIVEKIT_API_SECRET,
      },
      id
    )
    addEvent('agent.stopped', { agentId: id })
    res.json(result)
  } catch (e: any) {
    res.status(400).json({ error: e.message })
  }
})

router.post('/webhooks/livekit', async (req: Request, res: Response) => {
  const body = req.body || {}
  addEvent('livekit.event', body)
  if (env.AWELL_WEBHOOK_URL) {
    try {
      await fetch(env.AWELL_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
    } catch {}
  }
  res.json({ ok: true })
})
