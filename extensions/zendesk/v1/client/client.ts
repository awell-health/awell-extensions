import axios, { type AxiosResponse } from 'axios'
import { type Task, type TaskInput } from '../types'

class ZendeskBaseAPI {
  readonly _baseUrl: string
  readonly _token: string
  private readonly _headers: Record<string, string>

  constructor({
    baseUrl,
    apiToken,
    email,
    subdomain,
  }: {
    baseUrl: string
    apiToken: string
    email: string
    subdomain: string
  }) {
    this._baseUrl = `https://${subdomain}.zendesk.com/${baseUrl}`
    this._token = Buffer.from(`${email}/token:${apiToken}`).toString('base64')
    this._headers = {
      'Content-Type': 'application/json; charset=utf8',
      Accept: ' application/json',
      Authorization: `Basic ${this._token}`,
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

class ZendeskTasksAPI {
  private readonly _baseApi: ZendeskBaseAPI

  constructor({
    apiToken,
    email,
    subdomain,
  }: {
    apiToken: string
    email: string
    subdomain: string
  }) {
    this._baseApi = new ZendeskBaseAPI({
      subdomain,
      baseUrl: `v2/tasks`,
      apiToken,
      email,
    })
  }

  createTask = async (
    task: TaskInput
  ): Promise<AxiosResponse<{ task: Task }>> => {
    return await this._baseApi.post<TaskInput, { task: Task }>('', {
      body: task,
    })
  }

  updateTask = async (
    id: number,
    task: TaskInput
  ): Promise<AxiosResponse<{ task: Task }>> => {
    return await this._baseApi.put<TaskInput, { task: Task }>(`${id}`, {
      body: task,
    })
  }
}

export class ZendeskClient {
  readonly tasksApi: ZendeskTasksAPI

  constructor({
    apiToken,
    email,
    subdomain,
  }: {
    apiToken: string
    email: string
    subdomain: string
  }) {
    this.tasksApi = new ZendeskTasksAPI({ apiToken, email, subdomain })
  }
}
