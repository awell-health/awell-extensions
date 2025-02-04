export interface ElationWebhookPayload {
  action: string
  data: { id: string; patient?: number } & Record<string, unknown>
  resource: string
}
