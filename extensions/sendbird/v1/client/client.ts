import axios, { type AxiosResponse } from 'axios'
import {
  type UpdateUserInput,
  type CreateUserInput,
  type User,
  type Metadata,
} from '../types'

class SendbirdBaseAPI {
  readonly _applicationId: string
  readonly _baseUrl: string
  readonly _token: string
  private readonly _headers: Record<string, string>

  constructor({
    applicationId,
    baseUrl,
    token,
    tokenHeaderKey,
  }: {
    applicationId: string
    baseUrl: string
    token: string
    tokenHeaderKey: string
  }) {
    this._applicationId = applicationId
    this._baseUrl = baseUrl
    this._token = token
    this._headers = {
      'Content-Type': 'application/json; charset=utf8',
      [tokenHeaderKey]: this._token,
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
      tokenHeaderKey: 'Api-Token',
    })
  }

  createUser = async (user: CreateUserInput): Promise<AxiosResponse<User>> => {
    return await this._baseApi.post<CreateUserInput, User>('users', {
      body: user,
    })
  }

  updateUser = async ({
    user_id,
    ...user
  }: UpdateUserInput): Promise<AxiosResponse<User>> => {
    return await this._baseApi.put<Omit<UpdateUserInput, 'user_id'>, User>(
      `users/${encodeURIComponent(user_id)}`,
      {
        body: user,
      }
    )
  }

  getUser = async (userId: string): Promise<AxiosResponse<User>> => {
    return await this._baseApi.get<User>(`users/${encodeURIComponent(userId)}`)
  }

  deleteUser = async (userId: string): Promise<AxiosResponse<never>> => {
    return await this._baseApi.delete<never>(
      `users/${encodeURIComponent(userId)}`
    )
  }

  updateMetadata = async (
    userId: string,
    metadata: Metadata
  ): Promise<AxiosResponse<Metadata>> => {
    return await this._baseApi.put<
      { metadata: Metadata; upsert?: boolean },
      Metadata
    >(`users/${encodeURIComponent(userId)}/metadata`, {
      body: { metadata, upsert: true },
    })
  }

  /**
   * @description if `key` is empty -> removes all metadata
   */
  deleteMetadata = async (
    userId: string,
    key?: string
  ): Promise<AxiosResponse<never>> => {
    const deleteAllKeys = key === undefined || key === ''

    return await this._baseApi.delete<never>(
      `users/${encodeURIComponent(userId)}/metadata${
        deleteAllKeys ? '' : `/${encodeURIComponent(key)}`
      }`
    )
  }
}

class SendbirdDeskAPI {
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
      baseUrl: `https://desk-api-${applicationId}.sendbird.com/platform/v1`,
      token,
      tokenHeaderKey: 'SENDBIRDDESKAPITOKEN',
    })
  }
}

export class SendbirdClient {
  private readonly _applicationId: string
  readonly chatApi: SendbirdChatAPI
  readonly deskApi: SendbirdDeskAPI

  constructor({
    applicationId,
    chatApiToken,
    deskApiToken,
  }: {
    applicationId: string
    chatApiToken: string
    deskApiToken: string
  }) {
    this._applicationId = applicationId
    this.chatApi = new SendbirdChatAPI({ applicationId, token: chatApiToken })
    this.deskApi = new SendbirdDeskAPI({ applicationId, token: deskApiToken })
  }
}
