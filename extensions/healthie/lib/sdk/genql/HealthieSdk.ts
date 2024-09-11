import { type Client, createClient } from './generated'

/**
 * A class representing the Healthie SDK.
 */
export class HealthieSdk {
  /**
   * The API key used to authenticate API requests.
   */
  readonly apiKey: string

  /**
   * The client that calls the Healthie API.
   */
  readonly client: Client

  /**
   * The custom API URL to be used if provided.
   */
  readonly apiUrl: string

  /**
   * Creates an instance of the Healthie SDK.
   *
   * @param {Object} opts - The options for configuring the SDK.
   * @param {string} [opts.apiUrl] - The API URL.
   * @param {string} opts.apiKey - The API key to use for authentication.
   */
  constructor(opts: { apiKey: string; apiUrl: string }) {
    this.apiKey = opts.apiKey
    this.apiUrl = opts.apiUrl

    const client = createClient({
      url: this.apiUrl,
      headers: {
        Authorization: `Basic ${this.apiKey}`,
        AuthorizationSource: 'API',
      },
    })

    this.client = client
  }
}
