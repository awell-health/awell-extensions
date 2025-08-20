type EventItem = {
  id: string
  timestamp: string
  type: string
  payload: any
}

export const eventLog: EventItem[] = []

export const addEvent = (type: string, payload: any) => {
  eventLog.unshift({
    id: Math.random().toString(36).slice(2),
    timestamp: new Date().toISOString(),
    type,
    payload,
  })
}
