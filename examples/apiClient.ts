import {
  APIClient,
  DataWrapper,
  type DataWrapperCtor,
} from '@awell-health/extensions-core'
import { OAuthClientCredentials } from '@awell-health/extensions-core'

/**
 * This is an example of implementing data wrappers and API clients
 */

class SampleDataWrapper extends DataWrapper {
  public async hello(): Promise<'world'> {
    // This is where the actual API call would be made with `this.Request()`
    return 'world'
  }
}

class SampleAPIClient extends APIClient<SampleDataWrapper> {
  readonly ctor: DataWrapperCtor<SampleDataWrapper> = (
    token: string,
    baseUrl: string
  ) => new SampleDataWrapper(token, baseUrl)

  /**
   * It's recommended to override the base constructor, as it simplifies setup when the client is used by more
   * than one action.
   */
  public constructor(opts: unknown) {
    // This would be passed in opts, along with credentials for authentication and baseUrl
    const auth_url = 'https://example.com'

    /**
     * This is an example of handling client credentials flow.
     * For password flow, use OAuthPassword class and provide the user credentials.
     */
    const auth = new OAuthClientCredentials({
      auth_url,
      request_config: { client_id: '123', client_secret: 'secret' },
    })

    super({ auth, baseUrl: 'https://example.com' })
  }

  public async hello(): Promise<'world'> {
    return await this.FetchData<'world'>(async (dw) => await dw.hello())
  }
}

/**
 * Sometimes it's easier to use a constructor fxn for the api client.
 * In the case below, we validate the extension's settings as:
 * payloadSettings: Record<keyof typeof settings, string | undefined>
 * by parsing the settings according to our zod schema:
 * const { base_url, ... } = settingsSchema.parse(payloadSettings)
 */
export const makeSampleAPIClient = (
  payloadSettings: Record<string, string | undefined>
): SampleAPIClient => {
  const { base_url, auth_url, ...auth_request_settings } = payloadSettings

  return new SampleAPIClient({
    authUrl: auth_url,
    requestConfig: auth_request_settings,
    baseUrl: base_url,
  })
}
