export interface ActivityEvent {
  text: Record<string, string>
  date: string
  error?: {
    category:
      | 'MISSING_FIELDS'
      | 'MISSING_SETTINGS'
      | 'BAD_REQUEST'
      | 'SERVER_ERROR'
      | 'WRONG_INPUT'
    message: string
  }
}
