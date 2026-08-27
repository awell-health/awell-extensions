import { FieldsValidationSchema } from '../v1/actions/trackEvent/config/fields'
import { INVALID_EMAILS, VALID_EMAILS } from '../../../tests/zodCases'

describe('iterable trackEvent FieldsValidationSchema (zod 4)', () => {
  const base = { eventName: 'event' }

  it.each(VALID_EMAILS)('accepts email %s', (email) => {
    const result = FieldsValidationSchema.safeParse({ ...base, email })
    expect(result.success).toBe(true)
    expect(result.data?.email).toBe(email)
  })

  it.each(INVALID_EMAILS)('rejects email %j', (email) => {
    const result = FieldsValidationSchema.safeParse({ ...base, email })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toEqual(['email'])
  })

  it('treats an empty email as absent and then requires a userId', () => {
    const result = FieldsValidationSchema.safeParse({ ...base, email: '' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe(
      'Both "email" and "user ID" are empty. Please provide one of them.',
    )
  })
})
