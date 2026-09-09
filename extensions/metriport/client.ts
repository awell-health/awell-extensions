import { MetriportMedicalApi } from '@metriport/api-sdk'
import { type settings } from './settings'
import { settingsSchema } from './validation/settings.zod'

export const createMetriportApi = (
  payloadSettings: Record<keyof typeof settings, string | undefined>,
): MetriportMedicalApi => {
  const { apiKey, baseUrl } = settingsSchema.parse(payloadSettings)

  // An empty setting means "not configured", the same as an absent one.
  if (baseUrl !== undefined && baseUrl !== '') {
    return new MetriportMedicalApi(apiKey, {
      baseAddress: baseUrl,
    })
  }

  return new MetriportMedicalApi(apiKey, {
    sandbox: true,
  })
}
