import { MetriportMedicalApi } from '@metriport/api'
import { type settings } from './settings'
import { settingsSchema } from './validation/settings.zod'

export const createMetriportApi = (
  payloadSettings: Record<keyof typeof settings, string | undefined>
): MetriportMedicalApi => {
  const { apiKey, baseUrl } = settingsSchema.parse(payloadSettings)

  return new MetriportMedicalApi(apiKey, {
    baseAddress: baseUrl,
  })
}
