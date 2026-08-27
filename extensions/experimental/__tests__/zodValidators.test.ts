import { FieldsValidationSchema } from '../v1/actions/showQRCode/config/fields'
import { INVALID_URLS, VALID_URLS } from '../../../tests/zodCases'

describe('experimental showQRCode FieldsValidationSchema (zod 4)', () => {
  it.each(VALID_URLS)('accepts url %s', (url) => {
    expect(FieldsValidationSchema.safeParse({ url }).success).toBe(true)
  })

  it.each([...INVALID_URLS, ''])('rejects url %j', (url) => {
    expect(FieldsValidationSchema.safeParse({ url }).success).toBe(false)
  })
})
