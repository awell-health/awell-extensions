import { SettingsValidationSchema } from '../settings'
import { INVALID_URLS, VALID_URLS } from '../../../tests/zodCases'

describe('srfax SettingsValidationSchema (zod 4)', () => {
  const base = { accountId: 'acc', password: 'pw' }

  it.each(VALID_URLS)('accepts baseUrl %s', (baseUrl) => {
    expect(
      SettingsValidationSchema.safeParse({ ...base, baseUrl }).success,
    ).toBe(true)
  })

  it.each(INVALID_URLS)('rejects baseUrl %s', (baseUrl) => {
    expect(
      SettingsValidationSchema.safeParse({ ...base, baseUrl }).success,
    ).toBe(false)
  })

  it.each([undefined, ''])(
    'accepts baseUrl %j because the setting is optional',
    (baseUrl) => {
      const result = SettingsValidationSchema.safeParse({ ...base, baseUrl })
      expect(result.success).toBe(true)
      expect(result.data?.baseUrl).toBe(baseUrl)
    },
  )
})
