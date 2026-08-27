import { SettingsValidationSchema } from '../settings'
import { INVALID_URLS, VALID_URLS } from '../../../tests/zodCases'

describe('infobip SettingsValidationSchema (zod 4)', () => {
  const base = {
    apiKey: 'key',
    fromPhoneNumber: '+19033428784',
    fromEmail: 'from@example.com',
  }

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

  it('rejects an empty baseUrl (required setting)', () => {
    const result = SettingsValidationSchema.safeParse({ ...base, baseUrl: '' })
    expect(result.success).toBe(false)
  })

  it('reports the documented message for an empty baseUrl', () => {
    const result = SettingsValidationSchema.safeParse({ ...base, baseUrl: '' })
    expect(result.success).toBe(false)
    expect(result.error?.issues.map((i) => i.message)).toContain(
      'Missing "Base URL" in the extension settings.',
    )
  })

  it('rejects a missing baseUrl (the custom message only covers the nonempty check)', () => {
    // Same as before the migration: `.nonempty({ error })` customises the
    // too_small issue, so an absent key gets zod's default invalid_type text.
    const result = SettingsValidationSchema.safeParse({ ...base })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]).toMatchObject({
      code: 'invalid_type',
      path: ['baseUrl'],
    })
  })
})
