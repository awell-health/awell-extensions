import axios, { type AxiosResponse } from 'axios'
import { type BaseResponse, type SmsInput } from '../types'

class InfobipBaseAPI {
  readonly _baseUrl: string
  readonly _token: string
  private readonly _headers: Record<string, string>

  constructor({
    baseUrl,
    apiToken,
    tokenHeaderKey,
  }: {
    baseUrl: string
    apiToken: string
    tokenHeaderKey: string
  }) {
    this._baseUrl = baseUrl
    this._token = apiToken
    this._headers = {
      'Content-Type': 'application/json; charset=utf8',
      Accept: ' application/json',
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

class InfobipSmsAPI {
  private readonly _baseApi: InfobipBaseAPI

  constructor({ baseUrl, apiToken }: { baseUrl: string; apiToken: string }) {
    this._baseApi = new InfobipBaseAPI({
      baseUrl,
      apiToken: `App ${apiToken}`,
      tokenHeaderKey: 'Authorization',
    })
  }

  send = async (message: SmsInput): Promise<AxiosResponse<BaseResponse>> => {
    return await this._baseApi.post<SmsInput, BaseResponse>(
      'sms/2/text/advanced',
      {
        body: message,
      }
    )
  }
}

export class InfobipClient {
  readonly smsApi: InfobipSmsAPI

  constructor({ baseUrl, apiToken }: { baseUrl: string; apiToken: string }) {
    this.smsApi = new InfobipSmsAPI({ baseUrl, apiToken })
  }
}
