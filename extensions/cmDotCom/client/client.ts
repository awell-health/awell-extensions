import { type Message, MessageApiClient } from '@cmdotcom/text-sdk'
import { type MessageRequest } from './types'

export class CmClient {
  private readonly _client: MessageApiClient

  constructor({ productToken }: { productToken: string }) {
    this._client = new MessageApiClient(productToken)
  }

  sendSms = async (message: MessageRequest): ReturnType<Message['send']> => {
    return await this._client
      .createMessage()
      .setMessage([message.to], message.from, message.message)
      .send()
  }
}
