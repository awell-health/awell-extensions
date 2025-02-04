// import { MetriportMedicalApi } from '@metriport/api-sdk'
import { type settings } from './settings'
import { settingsSchema } from './validation/settings.zod'

export const createMetriportApi = (
  payloadSettings: Record<keyof typeof settings, string | undefined>,
): any => {
  return {} as any
}
// ): MetriportMedicalApi => {
//   const { apiKey, baseUrl } = settingsSchema.parse(payloadSettings)

//   return new MetriportMedicalApi(apiKey, {
//     baseAddress: baseUrl,
//   })
