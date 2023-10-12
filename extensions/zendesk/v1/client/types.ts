export interface ErrorResponse {
  details?: {
    value: Array<{
      type: string
      description: string
    }>
  }
  description: string
  error: string
}
