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

export interface UpdateTicketInput {
  comment?: {
    body: string
  }
  priority?: 'urgent' | 'high' | 'normal' | 'low'
  status?: 'new' | 'open' | 'pending' | 'hold' | 'solved' | 'closed'
}

export interface ZendeskApiErrorResponse {
  errors: Array<{
    error: {
      resource: string
      field: string
      code: string
      message: string
      details: string
    }
    meta: {
      type: string
      links: {
        more_info: string
      }
    }
  }>
  meta: {
    type: string
    http_status: string
    logref: string
    links: {
      more_info: string
    }
  }
}
