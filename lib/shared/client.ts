/**
 * This base client module contains two classes and the DataWrapper constructor type.
 *
 * The API Client manages the lifecycle of the call. When it's initialized some opts are passed in, along with the data wrapper constructor function.
 * The DataWrapper is responsible for calling an API and mapping the data, if necessary.
 * The DataWrapper Constructor function makes sure we always pass the DataWrapper a "good" token.
 *
 * Please see `${workspaceFolder}/extensions/elation/client` for an example of extending the base classes.
 */

import Axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { type OAuthOpts, OAuthPassword } from './auth'

export type DataWrapperCtor<DW extends DataWrapper> = (
  token: string,
  baseUrl: string
) => DW

export abstract class DataWrapper {
  readonly _client: AxiosInstance
  public constructor(token: string, baseUrl: string) {
    this._client = Axios.create({
      baseURL: baseUrl,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      validateStatus: (status) => {
        return status >= 200 && status < 300
      },
    })
  }

  protected async Request<T>(opts: AxiosRequestConfig): Promise<T> {
    const response = await this._client.request<T>(opts)
    return response.data
  }
}

export abstract class APIClient<DW extends DataWrapper> {
  // i'm just handling password rn. we can worry about extending later.
  readonly auth: OAuthPassword
  readonly baseUrl: string
  readonly ctor: DataWrapperCtor<DW>

  public constructor(opts: {
    auth: OAuthOpts
    baseUrl: string
    makeDataWrapper: DataWrapperCtor<DW>
  }) {
    this.auth = new OAuthPassword(opts.auth)
    this.baseUrl = opts.baseUrl
    this.ctor = opts.makeDataWrapper
  }

  /**
   * A fancy looking way to wrap the API call. There's a simple retry
   * mechanism in here, but it could be extended to include a more complex
   * retry mechanism.
   * @param apiCall something like dw => dw.getStuff()
   * @param isRetry if you don't want to retry, pass boolean `true` as an arg
   * @returns whatever dw.getStuff() returns
   */
  protected async FetchData<T>(
    apiCall: (_: DW) => Promise<T>,
    isRetry?: boolean
  ): Promise<T> {
    const dw = await this._getDataWrapper()
    try {
      const res = await apiCall(dw)
      return res
    } catch (err) {
      if (isRetry !== true) {
        await new Promise((resolve) => setTimeout(resolve, 250))
        return await this.FetchData<T>(apiCall, true)
      }
      throw err
    }
  }

  /**
   * Calls the authenticator and returns a data wrapper with a valid token.
   * @returns DataWrapper
   */
  private async _getDataWrapper(): Promise<DW> {
    const token = await this.auth.authenticate()
    return this.ctor(token.access_token, this.baseUrl)
  }
}
