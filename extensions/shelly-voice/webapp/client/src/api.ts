const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5175/api'

export async function createAgent(data: { voice: string; language: string; personality: string }) {
  const res = await fetch(`${API_URL}/agents`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create agent')
  return res.json()
}

export async function startAgent(agentId: string, sessionContext: any) {
  const res = await fetch(`${API_URL}/agents/${agentId}/start`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ sessionContext }),
  })
  if (!res.ok) throw new Error('Failed to start agent')
  return res.json()
}

export async function stopAgent(agentId: string) {
  const res = await fetch(`${API_URL}/agents/${agentId}/stop`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to stop agent')
  return res.json()
}

export async function getEvents() {
  const res = await fetch(`${API_URL}/events`)
  if (!res.ok) throw new Error('Failed to fetch events')
  return res.json()
}
