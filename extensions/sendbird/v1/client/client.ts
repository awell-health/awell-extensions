import axios, { type AxiosResponse } from 'axios'
import { type CreateUserInput, type User } from '../types'

class SendbirdBaseAPI {
  readonly _applicationId: string
  readonly _baseUrl: string
  readonly _token: string
  private readonly _headers: Record<string, string>

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
    } as const
  }

  post = async <I extends undefined | object, R>(
    url: string,
    { body }: { body: I }
  ): Promise<AxiosResponse<R>> => {
    return await axios.post<R>(`${this._baseUrl}/${url}`, body, {
      headers: this._headers,
    })
  }

  put = async <I extends undefined | object, R>(
    url: string,
    { body }: { body: I }
  ): Promise<AxiosResponse<R>> => {
    return await axios.put<R>(`${this._baseUrl}/${url}`, body, {
      headers: this._headers,
    })
  }

  patch = async <I extends undefined | object, R>(
    url: string,
    { body }: { body: I }
  ): Promise<AxiosResponse<R>> => {
    return await axios.patch<R>(`${this._baseUrl}/${url}`, body, {
      headers: this._headers,
    })
  }

  get = async <R>(url: string): Promise<AxiosResponse<R>> => {
    return await axios.get<R>(`${this._baseUrl}/${url}`, {
      headers: this._headers,
    })
  }

  delete = async <R>(url: string): Promise<AxiosResponse<R>> => {
    return await axios.delete<R>(`${this._baseUrl}/${url}`, {
      headers: this._headers,
    })
  }
}

class SendbirdChatAPI {
  readonly _baseApi: SendbirdBaseAPI

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

  createUser = async (user: CreateUserInput): Promise<AxiosResponse<User>> => {
    return await this._baseApi.post<CreateUserInput, User>('users', {
      body: user,
    })
  }
}

export class SendBirdClient {
  _applicationId: string
  chatApi: SendbirdChatAPI

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
