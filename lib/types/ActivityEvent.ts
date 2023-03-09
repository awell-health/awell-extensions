export interface ActivityEvent {
  text: string
  date: string
  error?: {
    category: 'BAD_REQUEST' | 'UNKNOWN_SERVER_ERROR'
    message: string
  }
}
