import {
  APIClient,
  DataWrapper,
  type DataWrapperCtor,
} from '../../../lib/shared/client'
import {
  OAuthClientCredentials,
  type OAuthGrantClientCredentialsRequest,
} from '../../../lib/shared/auth'
import { type settings } from './settings'
import { settingsSchema } from './validation/settings.zod'

interface ElationAPIClientConstructorProps {
  authUrl: string
  requestConfig: Omit<OAuthGrantClientCredentialsRequest, 'grant_type'>
  baseUrl: string
}

/**
 * This is an example of implementing data wrappers and API clients
 */

class ExamplePartnerDW extends DataWrapper {
  public async hello(id?: string): Promise<string> {
    // This is where the actual API call would be made with `this.Request()`
    // return this.Request<'world'>({
    //   method: 'POST',
    //   ...
    // })
    return 'Response: ' + (id ?? 'world')
  }
}

class ExamplePartnerAPIClient extends APIClient<ExamplePartnerDW> {
  readonly ctor: DataWrapperCtor<ExamplePartnerDW> = (
    token: string,
    baseUrl: string
  ) => new ExamplePartnerDW(token, baseUrl)

  /**
   * It's recommended to override the base constructor, as it simplifies setup when the client is used by more
   * than one action.
   */
  public constructor({
    authUrl,
    baseUrl,
    requestConfig,
  }: ElationAPIClientConstructorProps) {
    // This would be passed in opts, along with credentials for authentication and baseUrl

    /**
     * This is an example of handling client credentials flow.
     * For password flow, use OAuthPassword class and provide the user credentials.
     */
    const auth = new OAuthClientCredentials({
      auth_url: authUrl,
      request_config: requestConfig,
    })

    super({ auth, baseUrl })
  }

  public async hello(id?: string): Promise<string> {
    return await this.FetchData<string>(async (dw) => await dw.hello(id))
  }
}

/**
 * Sometimes it's easier to use a constructor fxn for the api client.
 * In the case below, we validate the extension's settings as:
 * payloadSettings: Record<keyof typeof settings, string | undefined>
 * by parsing the settings according to our zod schema:
 * const { base_url, ... } = settingsSchema.parse(payloadSettings)
 */
export const makeExamplePartnerAPIClient = (
  payloadSettings: Record<keyof typeof settings, string | undefined>
): ExamplePartnerAPIClient => {
  const {
    auth_url: authUrl,
    base_url: baseUrl,
    ...requestConfig
  } = settingsSchema.parse(payloadSettings)
  return new ExamplePartnerAPIClient({
    authUrl,
    requestConfig,
    baseUrl,
  })
}
