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

describe('zendesk SettingsValidationSchema - authentication methods', () => {
  it('accepts OAuth client credentials without email or API token', () => {
    const result = SettingsValidationSchema.safeParse({
      subdomain: 'company',
      oauth_client_id: 'awell',
      oauth_client_secret: 'secret',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an OAuth identifier without a secret', () => {
    const result = SettingsValidationSchema.safeParse({
      subdomain: 'company',
      oauth_client_id: 'awell',
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe(
      'Missing "OAuth Client Secret" in the extension settings.',
    )
  })

  it('rejects settings without any credentials', () => {
    const result = SettingsValidationSchema.safeParse({ subdomain: 'company' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain(
      'Missing Zendesk credentials',
    )
  })

  it('rejects an email without an API token', () => {
    const result = SettingsValidationSchema.safeParse({
      subdomain: 'company',
      user_email: 'a@b.co',
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe(
      'Missing "API Token" in the extension settings.',
    )
  })

  it.each([
    ['company', 'company'],
    ['company.zendesk.com', 'company'],
    ['https://company.zendesk.com/', 'company'],
    [' company ', 'company'],
  ])('normalises subdomain %j to %j', (input, expected) => {
    const result = SettingsValidationSchema.safeParse({
      subdomain: input,
      user_email: 'a@b.co',
      api_token: 'token',
    })
    expect(result.success).toBe(true)
    expect(result.data?.subdomain).toBe(expected)
  })
})
