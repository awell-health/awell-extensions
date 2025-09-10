export interface CreateTicketInput {
  subject: string
  comment: {
    body: string
  }
  group_id?: number
  priority?: 'urgent' | 'high' | 'normal' | 'low'
  external_id?: string
  tags?: string[]
}

export interface CreateTicketResponse {
  ticket: {
    id: number
    subject: string
    status: string
    created_at: string
    updated_at: string
  }
}

export interface ZendeskApiErrorResponse {
  details?: {
    [key: string]: Array<{
      type: string
      description: string
    }>
  }
  description?: string
  error?: string
}
