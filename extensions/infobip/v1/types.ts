export interface EmailAttachment {
  /** Filename shown to the recipient, including extension */
  filename: string
  /** Decoded file bytes */
  data: Buffer
  /** MIME type, e.g. application/pdf */
  contentType: string
}

export interface EmailInput {
  from?: string
  to: string[]
  templateId?: number
  cc?: string
  subject?: string
  html?: string
  replyTo?: string
  defaultPlaceholders?: string
  /**
   * Sent as a binary multipart part named `attachment`
   * (Infobip: POST /email/3/send, `attachment` is an array of binary files).
   */
  attachment?: EmailAttachment
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
