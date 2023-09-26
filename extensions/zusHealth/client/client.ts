import {
  DataWrapper,
  APIClient,
  type DataWrapperCtor,
  OAuthClientCredentials,
} from '@awell-health/extensions-core'
import { type ZusAPIClientConstrutorProps } from './type'
import { type settings } from '../settings'
import { settingsSchema } from '../validation'

export class ZusHealthDataWrapper extends DataWrapper {
  public async getResource(resourceWithId: string): Promise<any> {
    const response = await this.RequestRaw({
      method: 'GET',
      url: `/${resourceWithId}`,
    })

    return response
  }
}

export class ZusHealthAPIClient extends APIClient<ZusHealthDataWrapper> {
  readonly ctor: DataWrapperCtor<ZusHealthDataWrapper> = (
    token: string,
    baseUrl: string
  ) => new ZusHealthDataWrapper(token, baseUrl)

  public constructor({
    authUrl,
    requestConfig,
    ...opts
  }: ZusAPIClientConstrutorProps) {
    super({
      ...opts,
      auth: new OAuthClientCredentials({
        auth_url: authUrl,
        request_config: requestConfig,
      }),
    })
  }

  public async getResource(resourceWithId: string): Promise<any> {
    const response = await this.FetchData(
      async (dw) => await dw.getResource(resourceWithId)
    )
    return response.data
  }
}

export const makeAPIClient = (
  payloadSettings: Record<keyof typeof settings, string | undefined>
): ZusHealthAPIClient => {
  const { auth_url, base_url, ...authRquestSettings } =
    settingsSchema.parse(payloadSettings)

  return new ZusHealthAPIClient({
    authUrl: auth_url,
    requestConfig: authRquestSettings,
    baseUrl: base_url,
  })
}
