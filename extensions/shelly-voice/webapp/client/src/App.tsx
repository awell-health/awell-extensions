import { useEffect, useMemo, useState } from 'react'
import { createAgent, startAgent, stopAgent, getEvents } from './api'

type EventItem = { id: string; timestamp: string; type: string; payload: any }

export default function App() {
  const [voice, setVoice] = useState('alloy')
  const [language, setLanguage] = useState('en')
  const [personality, setPersonality] = useState('friendly')
  const [agentId, setAgentId] = useState<string>('')
  const [sessionId, setSessionId] = useState<string>('')
  const [status, setStatus] = useState<'idle' | 'running' | 'stopped'>('idle')
  const [events, setEvents] = useState<EventItem[]>([])
  const [jobToBeDone, setJobToBeDone] = useState('')
  const [patientContext, setPatientContext] = useState('')
  const [careSetting, setCareSetting] = useState<'outpatient' | 'inpatient' | 'virtual'>('outpatient')
  const [complianceNotes, setComplianceNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const canStart = useMemo(() => !!agentId && status !== 'running', [agentId, status])
  const canStop = useMemo(() => status === 'running', [status])

  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const res = await getEvents()
        setEvents(res.events || [])
      } catch {}
    }, 1500)
    return () => clearInterval(t)
  }, [])

  async function onCreate() {
    setLoading(true)
    setMessage(null)
    try {
      const res = await createAgent({ voice, language, personality, jobToBeDone, patientContext, careSetting, complianceNotes })
      setAgentId(res.agentId)
      setStatus('idle')
      setMessage({ type: 'success', text: `Agent created: ${res.agentId}` })
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.message || 'Failed to create agent' })
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function onStart() {
    if (!agentId) return
    setLoading(true)
    setMessage(null)
    try {
      const res = await startAgent(agentId, { source: 'ui' })
      setSessionId(res.sessionId)
      setStatus('running')
      setMessage({ type: 'success', text: `Session started: ${res.sessionId}` })
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.message || 'Failed to start agent' })
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function onStop() {
    if (!agentId) return
    setLoading(true)
    setMessage(null)
    try {
      await stopAgent(agentId)
      setStatus('stopped')
      setMessage({ type: 'success', text: 'Agent stopped' })
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.message || 'Failed to stop agent' })
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ margin: 24, fontFamily: 'Inter, system-ui, Arial' }}>
      <h1>Shelly Voice</h1>
      <div style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
        <label>
          Voice
          <input value={voice} onChange={e => setVoice(e.target.value)} style={{ display: 'block', width: '100%', padding: 8 }} />
        </label>
        <label>
          Language
          <input value={language} onChange={e => setLanguage(e.target.value)} style={{ display: 'block', width: '100%', padding: 8 }} />
        </label>
        <label>
          Personality
          <input value={personality} onChange={e => setPersonality(e.target.value)} style={{ display: 'block', width: '100%', padding: 8 }} />
        </label>
        <label>
          Job To Be Done
          <input value={jobToBeDone} onChange={e => setJobToBeDone(e.target.value)} style={{ display: 'block', width: '100%', padding: 8 }} />
        </label>
        <label>
          Patient Context
          <textarea value={patientContext} onChange={e => setPatientContext(e.target.value)} style={{ display: 'block', width: '100%', padding: 8 }} />
        </label>
        <label>
          Care Setting
          <select value={careSetting} onChange={e => setCareSetting(e.target.value as any)} style={{ display: 'block', width: '100%', padding: 8 }}>
            <option value="outpatient">Outpatient</option>
            <option value="inpatient">Inpatient</option>
            <option value="virtual">Virtual</option>
          </select>
        </label>
        <label>
          Compliance Notes
          <textarea value={complianceNotes} onChange={e => setComplianceNotes(e.target.value)} style={{ display: 'block', width: '100%', padding: 8 }} />
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCreate} disabled={loading}>{loading ? 'Creating…' : 'Create agent'}</button>
          <button onClick={onStart} disabled={loading || !canStart}>{loading ? 'Please wait…' : 'Start'}</button>
          <button onClick={onStop} disabled={loading || !canStop}>{loading ? 'Please wait…' : 'Stop'}</button>
        </div>
        {message && (
          <div style={{ padding: 8, borderRadius: 6, background: message.type === 'success' ? '#e7f7ec' : '#fdeaea', color: message.type === 'success' ? '#1e7e34' : '#b00020' }}>
            {message.text}
          </div>
        )}
        <div>
          <strong>Agent ID:</strong> {agentId || '-'}
        </div>
        <div>
          <strong>Session ID:</strong> {sessionId || '-'}
        </div>
        <div>
          <strong>Status:</strong> {status}
        </div>
      </div>

      <h2 style={{ marginTop: 24 }}>Events</h2>
      <div style={{ border: '1px solid #ddd', borderRadius: 6, padding: 12, maxHeight: 280, overflow: 'auto' }}>
        {events.length === 0 && <div>No events yet</div>}
        {events.map(ev => (
          <div key={ev.id} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
            <div style={{ fontSize: 12, color: '#666' }}>{new Date(ev.timestamp).toLocaleString()}</div>
            <div style={{ fontWeight: 600 }}>{ev.type}</div>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(ev.payload, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  )
}
