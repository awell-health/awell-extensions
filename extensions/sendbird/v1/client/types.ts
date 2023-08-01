import { type AxiosResponse } from 'axios'
import { type CreateUserInput, type User } from '../types'

export interface ErrorResponse {
  error: boolean
  code: number
  message: string
}

export interface ISendbirdSDK {
  readonly _applicationId: string
  readonly chatApi: ISendbirdChatAPI
}

export interface ISendbirdBaseAPI {
  readonly _applicationId: string
  readonly _baseUrl: string
  readonly _token: string

  post: <I extends undefined | object, R>(
    url: string,
    arg: { body: I }
  ) => Promise<AxiosResponse<R>>
}

export interface ISendbirdChatAPI {
  readonly _baseApi: ISendbirdBaseAPI

  createUser: (user: CreateUserInput) => Promise<AxiosResponse<User>>
}
