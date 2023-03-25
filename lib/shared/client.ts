import Axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosError,
} from 'axios'
import { AuthError } from './errors'
import { type OAuthOpts, OAuthPassword } from './auth'

export enum AuthType {
  BEARER = 'bearer',
}

export type DataWrapperCtor<DW extends DataWrapper> = (
  token: string,
  baseUrl: string
) => DW

export abstract class DataWrapper {
  protected _client: AxiosInstance
  public constructor(authType: AuthType, token: string, baseUrl: string) {
    this._client = Axios.create({
      baseURL: baseUrl,
      headers: { Authorization: `${authType} ${token}` },
      validateStatus: (status) => status === 200,
    })
  }

  protected async Request<T>(opts: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this._client.request<T>(opts)
      return response.data
    } catch (e) {
      const err = e as AxiosError

      switch (err.status) {
        case 401: {
          throw new AuthError(err.message, err.status)
        }
        default: {
          throw new Error(
            `Status code ${err.status === undefined ? '' : err.status} ${
              err.message
            }`
          )
        }
      }
    }
  }
}

export abstract class APIClient<DW extends DataWrapper> {
  // i'm just handling password rn. we can worry about extending later.
  readonly auth: OAuthPassword
  // because we're doing a simple oauth password (still calls the auth server)
  // i'm not as concerned about storing a refresh token and using it to get
  // the access token... it's kind of pointless, tbh.
  readonly baseUrl: string
  readonly ctor: DataWrapperCtor<DW>

  public constructor(
    authOpts: OAuthOpts,
    baseUrl: string,
    ctor: DataWrapperCtor<DW>
  ) {
    this.auth = new OAuthPassword(authOpts)
    this.baseUrl = baseUrl
    this.ctor = ctor
  }

  protected async fetchData<T>(
    apiCall: (_: DW) => Promise<T>,
    retry?: boolean
  ): Promise<T> {
    const dw = await this.getDataWrapper()
    try {
      const res = await apiCall(dw)
      return res
    } catch (err) {
      if (retry !== true) {
        return await this.fetchData<T>(apiCall, true)
      }
      throw err
    }
  }

  protected async getDataWrapper(): Promise<DW> {
    const token = await this.auth.Authenticate()
    return this.ctor(token.access_token, this.baseUrl)
  }
}
