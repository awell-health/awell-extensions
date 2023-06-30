export interface MessageRequest {
  from: string
  to: string
  message: string
  reference?: string
}

interface BaseResponse<T> {
  data: T
}

export interface MessageResponse
  extends BaseResponse<{
    details: string
    errorCode: number
    messages: Array<{
      to: string
      status: string
      reference: string
      parts: number
      messageDetails: string
      messageErrorCode: number
    }>
  }> {}

export interface CmSDK {
  messages_SendMessage: (arg: {
    messages: {
      authentication: { productToken: string }
      msg: [
        {
          from: string
          body: {
            type?: string
            content: string
          }
          reference?: string
          to: Array<{
            number: string
          }>
          allowedChannels?: string[]
          minimumNumberOfMessageParts?: number
          maximumNumberOfMessageParts?: number
        }
      ]
    }
  }) => Promise<MessageResponse>
}
