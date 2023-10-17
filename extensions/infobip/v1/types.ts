export interface EmailInput {
  from?: string
  to: string[]
  templateId?: number
  cc?: string
  subject?: string
  html?: string
  replyTo?: string
}

export interface SmsInput {
  messages: Array<{
    destinations: Array<{ to: string }>
    from: string
    text: string
  }>
}

export interface BaseResponse {
  bulkId: string
  messages: Array<{ messageId: string; to: string }>
}

export interface ResponseError {
  requestError: {
    serviceException: {
      messageId: string
      text: string
    }
  }
}
