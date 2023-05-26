import { ElationAPIClient } from './client'
import type { settings } from './settings'
import { ServiceContainer } from '@awell-health/awell-extensions-types'
import { settingsSchema } from './validation/settings.zod'

export const makeAPIClient = (
  payloadSettings: Record<keyof typeof settings, string | undefined>
): ElationAPIClient => {
  const { base_url, auth_url, ...auth_request_settings } =
    settingsSchema.parse(payloadSettings)

  const cacheService = ServiceContainer.get('authCacheService')

  return new ElationAPIClient({
    cacheService,
    authUrl: auth_url,
    requestConfig: auth_request_settings,
    baseUrl: base_url,
  })
}
