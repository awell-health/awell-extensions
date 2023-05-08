import type { ActivityWrapperInjector } from '../../lib/types'
import { ElationAPIClient } from './client'
import type { settings } from './settings'
import type { CacheService } from '../../services/cache/cache'
import { settingsSchema } from './validation/settings.zod'

export const makeAPIClient = (
  payloadSettings: Record<keyof typeof settings, string | undefined>,
  cacheService?: CacheService<string>
): ElationAPIClient => {
  const { base_url, auth_url, ...auth_request_settings } =
    settingsSchema.parse(payloadSettings)

  return new ElationAPIClient({
    cacheService,
    authUrl: auth_url,
    requestConfig: auth_request_settings,
    baseUrl: base_url,
  })
}

export const elationAPIClientInjector: ActivityWrapperInjector<
  [ElationAPIClient],
  ['authCacheService']
> = (payload, onComplete, onError, services): [ElationAPIClient] => [
  makeAPIClient(payload.settings, services.authCacheService),
]
