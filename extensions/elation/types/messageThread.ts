export interface MessageThreadInput {
  patient: number
  sender: number
  practice: number
  document_date: string
  chart_date: string
  is_urgent: boolean
  messages: Array<{
    body: string
    send_date: string
    sender: number
  }>
}

export interface MessageThreadResponse {
  id: number
  created_date: string
  patient: number
  practice: number
  is_urgent: boolean
  messages: Array<{
    id: number
    body: string
    send_date: string
    sender: number
  }>
}

export interface AddMessageToThreadInput {
  thread: number
  sender: number
  body: string
  send_date: string
}
