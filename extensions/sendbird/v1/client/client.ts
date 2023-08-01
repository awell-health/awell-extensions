import { type CreateUserInput, type User } from '../types'
import {
  type ISendbirdChatAPI,
  type ISendbirdSDK,
  type ISendbirdBaseAPI,
} from './types'

class SendbirdBaseAPI implements ISendbirdBaseAPI {
  readonly _applicationId: string
  readonly _baseUrl: string
  readonly _token: string
  private readonly _headers: HeadersInit

  constructor({
    applicationId,
    baseUrl,
    token,
  }: {
    applicationId: string
    baseUrl: string
    token: string
  }) {
    this._applicationId = applicationId
    this._baseUrl = baseUrl
    this._token = token
    this._headers = {
      'Content-Type': 'application/json; charset=utf8',
      'Api-Token': this._token,
    }
  }

  post = async <I extends undefined | object, R>(
    url: string,
    { body }: { body: I }
  ): Promise<R> =>
    (await fetch(`${this._baseUrl}/${url}`, {
      body: body as BodyInit,
      method: 'POST',
      headers: this._headers,
    })) as R
}

class SendbirdChatAPI implements ISendbirdChatAPI {
  readonly _baseApi: ISendbirdBaseAPI

  constructor({
    applicationId,
    token,
  }: {
    applicationId: string
    token: string
  }) {
    this._baseApi = new SendbirdBaseAPI({
      applicationId,
      baseUrl: `https://api-${applicationId}.sendbird.com/v3`,
      token,
    })
  }

  createUser = async (user: CreateUserInput): Promise<User> => {
    return await this._baseApi.post<CreateUserInput, User>('users', {
      body: user,
    })
  }
}

export class SendBirdClient implements ISendbirdSDK {
  _applicationId: string
  chatApi: ISendbirdChatAPI

  constructor({
    applicationId,
    chatApiToken,
  }: {
    applicationId: string
    chatApiToken: string
  }) {
    this._applicationId = applicationId
    this.chatApi = new SendbirdChatAPI({ applicationId, token: chatApiToken })
  }
}
