import axios, { type AxiosResponse } from 'axios'
import { type Task, type TaskInput } from '../types'

class ZendeskBaseAPI {
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

class ZendeskSalesAPI {
  private readonly _baseApi: ZendeskBaseAPI

  constructor({ apiToken }: { apiToken: string }) {
    this._baseApi = new ZendeskBaseAPI({
      baseUrl: `https://api.getbase.com`,
      apiToken: `Bearer ${apiToken}`,
      tokenHeaderKey: 'Authorization',
    })
  }

  createTask = async (
    task: TaskInput
  ): Promise<AxiosResponse<{ task: Task }>> => {
    return await this._baseApi.post<TaskInput, { task: Task }>('v2/tasks', {
      body: task,
    })
  }

  updateTask = async (
    id: number,
    task: TaskInput
  ): Promise<AxiosResponse<{ task: Task }>> => {
    return await this._baseApi.put<TaskInput, { task: Task }>(
      `v2/tasks/${id}`,
      {
        body: task,
      }
    )
  }
}

export class ZendeskClient {
  readonly salesApi: ZendeskSalesAPI

  constructor({ salesApiToken }: { salesApiToken: string }) {
    this.salesApi = new ZendeskSalesAPI({ apiToken: salesApiToken })
  }
}
