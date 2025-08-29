const API = import.meta.env.VITE_API_URL || 'http://localhost:5057/api'
const BASIC = import.meta.env.VITE_API_BASIC_AUTH as string | undefined

function authHeaders(extra?: HeadersInit): HeadersInit {
  const headers: Record<string, string> = { ...(extra as Record<string, string>) }
  if (BASIC) {
    try {
      headers['Authorization'] = `Basic ${btoa(BASIC)}`
    } catch {}
  }
  return headers
}

export async function createAgent(body: { voice: string; language: string; personality: string; jobToBeDone?: string; patientContext?: string; careSetting?: string; complianceNotes?: string }) {
  const res = await fetch(`${API}/agents`, {
    method: 'POST',
    headers: authHeaders({ 'content-type': 'application/json' }),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let detail = ''
    try {
      const j = await res.json()
      detail = j?.error ? `: ${j.error}` : ''
    } catch {}
    throw new Error(`Failed to create agent${detail}`)
  }
  return res.json()
}

export async function startAgent(agentId: string, sessionContext?: Record<string, unknown>) {
  const res = await fetch(`${API}/agents/${agentId}/start`, {
    method: 'POST',
    headers: authHeaders({ 'content-type': 'application/json' }),
    body: JSON.stringify({ sessionContext }),
  })
  if (!res.ok) {
    let detail = ''
    try {
      const j = await res.json()
      detail = j?.error ? `: ${j.error}` : ''
    } catch {}
    throw new Error(`Failed to start agent${detail}`)
  }
  return res.json()
}

export async function stopAgent(agentId: string) {
  const res = await fetch(`${API}/agents/${agentId}/stop`, {
    method: 'POST',
    headers: authHeaders(),
  })
  if (!res.ok) {
    let detail = ''
    try {
      const j = await res.json()
      detail = j?.error ? `: ${j.error}` : ''
    } catch {}
    throw new Error(`Failed to stop agent${detail}`)
  }
  return res.json()
}

export async function getEvents() {
  const res = await fetch(`${API}/events`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to get events')
  return res.json()
}
