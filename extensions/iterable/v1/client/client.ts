import axios, { type AxiosResponse } from 'axios'
import { type ApiResponse, type SendEmailRequest } from './types'

class IterableBaseAPI {
  readonly _baseUrl: string
  readonly _apiKey: string
  private readonly _headers: Record<string, string>

  constructor({ baseUrl, apiKey }: { baseUrl: string; apiKey: string }) {
    this._baseUrl = baseUrl
    this._apiKey = apiKey
    this._headers = {
      'Content-Type': 'application/json; charset=utf8',
      'Api-Key': this._apiKey,
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

class IterableEmailAPI {
  private readonly _baseApi: IterableBaseAPI

  constructor({ apiKey }: { apiKey: string }) {
    this._baseApi = new IterableBaseAPI({
      baseUrl: `https://api.iterable.com/api/email`,
      apiKey,
    })
  }

  sendEmail = async (
    body: SendEmailRequest
  ): Promise<AxiosResponse<ApiResponse>> => {
    return await this._baseApi.post<SendEmailRequest, ApiResponse>('target', {
      body,
    })
  }
}

export class IterableClient {
  readonly emailApi: IterableEmailAPI

  constructor({ apiKey }: { apiKey: string }) {
    this.emailApi = new IterableEmailAPI({ apiKey })
  }
}
