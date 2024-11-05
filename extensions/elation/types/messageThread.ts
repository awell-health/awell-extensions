export interface MessageThreadInput {
  patient: number
  practice: number
  is_urgent?: boolean
  messages: Array<{ body: string }>
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
