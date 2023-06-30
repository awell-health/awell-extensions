import api from 'api'
import { type CmSDK, type MessageRequest } from './types'

export class CmClient {
  private readonly _client: CmSDK
  private readonly _productToken: string

  constructor({ productToken }: { productToken: string }) {
    this._productToken = productToken
    this._client = api('@messaging/v1.1#1f38u2plibh3cmv')
  }

  readonly sendSms = async ({
    from,
    to,
    message,
    reference,
  }: MessageRequest): ReturnType<CmSDK['messages_SendMessage']> => {
    return await this._client.messages_SendMessage({
      messages: {
        authentication: { productToken: this._productToken },
        msg: [
          {
            from,
            body: {
              type: 'auto',
              content: message,
            },
            reference,
            to: [
              {
                number: to,
              },
            ],
            allowedChannels: ['SMS'],
            minimumNumberOfMessageParts: 1,
            maximumNumberOfMessageParts: 8,
          },
        ],
      },
    })
  }
}
