const API = import.meta.env.VITE_API_URL || 'http://localhost:5057/api'

export async function createAgent(body: { voice: string; language: string; personality: string }) {
  const res = await fetch(`${API}/agents`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to create agent')
  return res.json()
}

export async function startAgent(agentId: string, sessionContext: Record<string, unknown>) {
  const res = await fetch(`${API}/agents/${agentId}/start`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ sessionContext }),
  })
  if (!res.ok) throw new Error('Failed to start agent')
  return res.json()
}

export async function stopAgent(agentId: string) {
  const res = await fetch(`${API}/agents/${agentId}/stop`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error('Failed to stop agent')
  return res.json()
}

export async function getEvents() {
  const res = await fetch(`${API}/events`)
  if (!res.ok) throw new Error('Failed to get events')
  return res.json()
}
