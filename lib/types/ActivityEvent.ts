export interface ActivityEvent {
  // TODO: Decide if we want to reuse the action enum here or give full flexibility to extension devs
  action: string
  date: string
  error?: {
    category: 'BAD_REQUEST' | 'UNKNOWN_SERVER_ERROR'
    message: string
  }
}
