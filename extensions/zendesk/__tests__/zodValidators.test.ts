import { SettingsValidationSchema } from '../settings'
import { INVALID_EMAILS, VALID_EMAILS } from '../../../tests/zodCases'

describe('zendesk SettingsValidationSchema (zod 4)', () => {
  const base = { subdomain: 'company', api_token: 'token' }

  it.each(VALID_EMAILS)('accepts user_email %s', (user_email) => {
    expect(
      SettingsValidationSchema.safeParse({ ...base, user_email }).success,
    ).toBe(true)
  })

  it.each([...INVALID_EMAILS, ''])('rejects user_email %j', (user_email) => {
    const result = SettingsValidationSchema.safeParse({ ...base, user_email })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe(
      'Invalid "User Email" in the extension settings.',
    )
  })

  it('rejects an empty subdomain with the documented message', () => {
    const result = SettingsValidationSchema.safeParse({
      ...base,
      subdomain: '',
      user_email: 'a@b.co',
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe(
      'Missing "Zendesk Subdomain" in the extension settings.',
    )
  })
})
