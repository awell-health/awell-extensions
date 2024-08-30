import { SettingsValidationSchema } from '../settings'

describe('Settings', () => {
  test('Opt out language settings', async () => {
    const settings = {
      accountSid: 'AC-accountSid',
      authToken: 'authToken',
      addOptOutLanguage: undefined,
      optOutLanguage: undefined,
      language: '',
    }
    const result = SettingsValidationSchema.safeParse(settings)

    if (!result.success) {
      console.log(result.error.errors)
    }

    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data.addOptOutLanguage).toEqual(true) // Default is true
      expect(result.data.language).toEqual('en') // Default is English
    }
  })
})
