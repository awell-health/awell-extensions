import {
  cache,
  OAuth,
  OAuthClientCredentials,
} from '@awell-health/extensions-core'
import { isNil } from 'lodash'
import { type ValidatedSettings } from '../../settings'

/**
 * Token cache shared by all Zendesk clients in this process. The OAuth
 * classes in extensions-core key entries by a hash of the grant request, so
 * one cache serves every Zendesk account. The platform can substitute a
 * distributed cache; see the extensions-core `CacheService` interface.
 */
export const zendeskCacheService = new cache.InMemoryCache()

/** HTTP authorization scheme the access token must be sent with. */
export type AuthorizationScheme = 'Bearer' | 'Basic'

export const getZendeskBaseUrl = (subdomain: string): string =>
  `https://${subdomain}.zendesk.com`

/**
 * Legacy authentication with a user email and API token.
 *
 * Zendesk expects `Authorization: Basic base64("{email}/token:{api_token}")`.
 * Nothing needs to be fetched or cached, so `getAccessToken` simply returns
 * the encoded credentials. Extending {@link OAuth} lets the client reuse the
 * extensions-core `APIClient` machinery for both authentication methods.
 *
 * Zendesk deactivates all API tokens on 2027-04-30.
 */
export class ZendeskApiTokenAuth extends OAuth {
  private readonly encodedCredentials: string

  constructor({
    subdomain,
    userEmail,
    apiToken,
  }: {
    subdomain: string
    userEmail: string
    apiToken: string
  }) {
    super({
      auth_url: getZendeskBaseUrl(subdomain),
      // Never sent: getAccessToken is overridden below.
      request_config: {
        grant_type: 'client_credentials',
        client_id: userEmail,
        client_secret: apiToken,
      },
      cacheService: new cache.NoCache(),
    })
    this.encodedCredentials = Buffer.from(
      `${userEmail}/token:${apiToken}`,
    ).toString('base64')
  }

  public async getAccessToken(): Promise<string> {
    return this.encodedCredentials
  }

  public async invalidateCachedToken(): Promise<void> {
    // Static credentials; nothing to invalidate.
  }
}

/**
 * OAuth client credentials grant against the account's token endpoint.
 * https://developer.zendesk.com/api-reference/ticketing/oauth/grant_type_tokens/
 *
 * extensions-core posts the request form-encoded with `client_id`,
 * `client_secret`, `grant_type` and `scope` in the body, caches the access
 * token until `expires_in` elapses (Zendesk defaults to 30 minutes) and
 * re-authenticates on a 401.
 */
export class ZendeskOAuthClientCredentials extends OAuthClientCredentials {
  constructor({
    subdomain,
    clientId,
    clientSecret,
  }: {
    subdomain: string
    clientId: string
    clientSecret: string
  }) {
    super({
      auth_url: `${getZendeskBaseUrl(subdomain)}/oauth/tokens`,
      request_config: {
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'read write',
      },
      cacheService: zendeskCacheService,
    })
  }
}

export interface ZendeskAuth {
  auth: OAuth
  scheme: AuthorizationScheme
}

export const makeZendeskAuth = (settings: ValidatedSettings): ZendeskAuth => {
  if (
    !isNil(settings.oauth_client_id) &&
    !isNil(settings.oauth_client_secret)
  ) {
    return {
      scheme: 'Bearer',
      auth: new ZendeskOAuthClientCredentials({
        subdomain: settings.subdomain,
        clientId: settings.oauth_client_id,
        clientSecret: settings.oauth_client_secret,
      }),
    }
  }

  if (!isNil(settings.user_email) && !isNil(settings.api_token)) {
    return {
      scheme: 'Basic',
      auth: new ZendeskApiTokenAuth({
        subdomain: settings.subdomain,
        userEmail: settings.user_email,
        apiToken: settings.api_token,
      }),
    }
  }

  // SettingsValidationSchema guarantees one of the two is present.
  throw new Error('Zendesk settings do not contain usable credentials')
}
