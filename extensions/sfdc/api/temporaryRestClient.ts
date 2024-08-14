import axios, { type AxiosResponse } from 'axios'
import { type Task, type TaskInput } from '../../zendesk/v1/types'
import { ResourceType, type SalesApiBody } from '../../zendesk/v1/client/types'
import { CreateRecordInputType, CreateRecordResponseType } from './schema'

/**
 * This client provides access to the Salesforce API by directly passing an access token.
 *
 * ⚠️ Important: This client should **not** be used in production environments.
 * Instead, the OAuth client with client credentials grant, found in `./client.ts`,
 * should be utilized.
 *
 * Note: This client was specifically created for bootcamp purposes due to issues
 * encountered with the client credentials grant. Instead of using the recommended
 * approach, we are currently obtaining an access token via the password grant
 * and passing it directly into this client.
 *
 * References:
 * https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_username_password_flow.htm&type=5
 */
class SalesforceTemporaryBaseAPI {
  readonly _baseUrl: string
  readonly _access_token: string
  private readonly _headers: Record<string, string>

  constructor({
    baseUrl,
    accessToken,
  }: {
    baseUrl: string
    accessToken: string
  }) {
    this._baseUrl = baseUrl
    this._access_token = accessToken
    this._headers = {
      'Content-Type': 'application/json',
      Authorization: this._access_token,
    } as const
  }

  private async handleRequest<I extends undefined | object, R>(
    requestFn: () => Promise<AxiosResponse<R>>,
    url: string,
    method: string,
    body?: I
  ): Promise<AxiosResponse<R>> {
    try {
      const response = await requestFn()
      return response
    } catch (error) {
      console.error(`Error during ${method} request to ${this._baseUrl}${url}`)
      console.error('Request headers:', this._headers)
      if (body) {
        console.error('Request body:', body)
      }
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status)
        console.error('Response headers:', error.response?.headers)
        console.error('Response data:', error.response?.data)
      } else {
        const typedError = error as Error
        console.error('Error message:', typedError.message)
      }
      throw error
    }
  }

  post = async <I extends undefined | object, R>(
    url: string,
    { body }: { body: I }
  ): Promise<AxiosResponse<R>> => {
    return this.handleRequest(
      () =>
        axios.post<R>(`${this._baseUrl}/${url}`, body, {
          headers: this._headers,
        }),
      url,
      'POST',
      body
    )
  }

  put = async <I extends undefined | object, R>(
    url: string,
    { body }: { body: I }
  ): Promise<AxiosResponse<R>> => {
    return this.handleRequest(
      () =>
        axios.put<R>(`${this._baseUrl}/${url}`, body, {
          headers: this._headers,
        }),
      url,
      'PUT',
      body
    )
  }

  patch = async <I extends undefined | object, R>(
    url: string,
    { body }: { body: I }
  ): Promise<AxiosResponse<R>> => {
    return this.handleRequest(
      () =>
        axios.patch<R>(`${this._baseUrl}/${url}`, body, {
          headers: this._headers,
        }),
      url,
      'PATCH',
      body
    )
  }

  get = async <R>(url: string): Promise<AxiosResponse<R>> => {
    return this.handleRequest(
      () =>
        axios.get<R>(`${this._baseUrl}/${url}`, {
          headers: this._headers,
        }),
      url,
      'GET'
    )
  }

  delete = async <R>(url: string): Promise<AxiosResponse<R>> => {
    return this.handleRequest(
      () =>
        axios.delete<R>(`${this._baseUrl}/${url}`, {
          headers: this._headers,
        }),
      url,
      'DELETE'
    )
  }
}

class SalesforceTemporaryAPI {
  private readonly _baseApi: SalesforceTemporaryBaseAPI
  private readonly apiVersion: string

  constructor({
    accessToken,
    baseUrl,
    apiVersion,
  }: {
    accessToken: string
    baseUrl: string
    apiVersion: string
  }) {
    this._baseApi = new SalesforceTemporaryBaseAPI({
      baseUrl,
      accessToken: `Bearer ${accessToken}`,
    })
    this.apiVersion = apiVersion
  }

  createRecord = async (
    input: CreateRecordInputType
  ): Promise<AxiosResponse<CreateRecordResponseType>> => {
    return await this._baseApi.post(
      `/services/data/${this.apiVersion}/sobjects/${input.sObject}/`,
      {
        body: input.data,
      }
    )
  }
}

export class SalesforceTemporaryClient {
  readonly api: SalesforceTemporaryAPI

  constructor({
    accessToken,
    baseUrl,
    apiVersion,
  }: {
    accessToken: string
    baseUrl: string
    apiVersion: string
  }) {
    this.api = new SalesforceTemporaryAPI({ accessToken, baseUrl, apiVersion })
  }
}
