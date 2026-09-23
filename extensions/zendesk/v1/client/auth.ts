import axios from 'axios'
import { isNil } from 'lodash'
import { type ValidatedSettings } from '../../settings'
import { zOAuthTokenResponse } from './types'

export type ZendeskAuth =
  | { type: 'oauth'; clientId: string; clientSecret: string }
  | { type: 'api_token'; userEmail: string; apiToken: string }

export const getAuthFromSettings = (settings: ValidatedSettings): ZendeskAuth => {
  if (!isNil(settings.oauth_client_id) && !isNil(settings.oauth_client_secret)) {
    return {
      type: 'oauth',
      clientId: settings.oauth_client_id,
      clientSecret: settings.oauth_client_secret,
    }
  }

  if (!isNil(settings.user_email) && !isNil(settings.api_token)) {
    return {
      type: 'api_token',
      userEmail: settings.user_email,
      apiToken: settings.api_token,
    }
  }

  // SettingsValidationSchema guarantees one of the two is present.
  throw new Error('Zendesk settings do not contain usable credentials')
}

interface CachedToken {
  accessToken: string
  /** Epoch milliseconds after which the token must not be reused. */
  expiresAt: number
}

/**
 * Access tokens are cached per subdomain + client so that a burst of
 * activities does not request a new token for every call. Zendesk tokens
 * expire after 30 minutes by default; we refresh a minute early.
 */
const tokenCache = new Map<string, CachedToken>()

const EXPIRY_SAFETY_MARGIN_MS = 60 * 1000
const DEFAULT_TOKEN_TTL_SECONDS = 30 * 60

export const clearTokenCache = (): void => {
  tokenCache.clear()
}

export const getOAuthAccessToken = async ({
  subdomain,
  clientId,
  clientSecret,
}: {
  subdomain: string
  clientId: string
  clientSecret: string
}): Promise<string> => {
  const cacheKey = `${subdomain}:${clientId}`
  const cached = tokenCache.get(cacheKey)

  if (!isNil(cached) && cached.expiresAt > Date.now()) {
    return cached.accessToken
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'read write',
  })

  const response = await axios.post(
    `https://${subdomain}.zendesk.com/oauth/tokens`,
    body.toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  )

  const token = zOAuthTokenResponse.parse(response.data)
  const ttlSeconds = token.expires_in ?? DEFAULT_TOKEN_TTL_SECONDS

  tokenCache.set(cacheKey, {
    accessToken: token.access_token,
    expiresAt: Date.now() + ttlSeconds * 1000 - EXPIRY_SAFETY_MARGIN_MS,
  })

  return token.access_token
}

export const getAuthorizationHeader = async (
  subdomain: string,
  auth: ZendeskAuth,
): Promise<string> => {
  if (auth.type === 'oauth') {
    const accessToken = await getOAuthAccessToken({
      subdomain,
      clientId: auth.clientId,
      clientSecret: auth.clientSecret,
    })
    return `Bearer ${accessToken}`
  }

  const credentials = `${auth.userEmail}/token:${auth.apiToken}`
  return `Basic ${Buffer.from(credentials).toString('base64')}`
}
