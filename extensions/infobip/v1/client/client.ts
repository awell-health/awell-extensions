import axios, { type AxiosResponse } from 'axios'
import { type EmailInput, type BaseResponse, type SmsInput } from '../types'
import FormData from 'form-data'

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
      [tokenHeaderKey]: this._token,
    } as const
  }

  post = async <I extends undefined | object | FormData, R>(
    url: string,
    { body }: { body: I },
    headers?: Record<string, string>
  ): Promise<AxiosResponse<R>> => {
    return await axios.post<R>(`${this._baseUrl}/${url}`, body, {
      headers: { ...this._headers, ...headers },
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
      },
      {
        'Content-Type': 'application/json; charset=utf8',
        Accept: 'application/json',
      }
    )
  }
}

class InfobipEmailAPI {
  private readonly _baseApi: InfobipBaseAPI

  constructor({ baseUrl, apiToken }: { baseUrl: string; apiToken: string }) {
    this._baseApi = new InfobipBaseAPI({
      baseUrl,
      apiToken: `App ${apiToken}`,
      tokenHeaderKey: 'Authorization',
    })
  }

  send = async (message: EmailInput): Promise<AxiosResponse<BaseResponse>> => {
    const formData = new FormData()

    for (const key in message) {
      if (Object.hasOwnProperty.call(message, key)) {
        // @ts-expect-error this is okay
        const value = message[key]
        if (value !== undefined && value !== '') {
          formData.append(key, value.toString())
        }
      }
    }

    return await this._baseApi.post<FormData, BaseResponse>(
      'email/3/send',
      {
        body: formData,
      },
      { 'Content-Type': 'multipart/form-data' }
    )
  }
}

export class InfobipClient {
  readonly smsApi: InfobipSmsAPI
  readonly emailApi: InfobipEmailAPI

  constructor({ baseUrl, apiToken }: { baseUrl: string; apiToken: string }) {
    this.smsApi = new InfobipSmsAPI({ baseUrl, apiToken })
    this.emailApi = new InfobipEmailAPI({ baseUrl, apiToken })
  }
}
