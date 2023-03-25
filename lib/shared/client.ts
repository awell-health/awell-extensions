import { create, AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'
import { AuthError } from './errors'
export enum AuthType {
  BEARER = 'bearer',
}
export abstract class DataWrapper {
  protected client: AxiosInstance
  public constructor(authType: AuthType, token: string, baseUrl: string) {
    this.client = create({
      baseURL: baseUrl,
      headers: { Authorization: `${authType} ${token}` },
      validate: (status) => {
        status === 200
      },
    })
  }

  protected async Request<T>(opts: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.reuqest<T>(opts)
      return response.data
    } catch (e) {
      const err = e as AxiosError

      switch (err.code) {
        case 401: {
          throw new AuthError(err.message, err.code)
        }
        default: {
          throw new Error(`Status code ${err.code}: ${err.message}`)
        }
      }
    }
  }
}
