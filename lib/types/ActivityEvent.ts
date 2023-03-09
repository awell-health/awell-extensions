export interface ActivityEvent {
  text: Record<string, string>
  date: string
  error?: {
    category: string
    message: string
  }
}
