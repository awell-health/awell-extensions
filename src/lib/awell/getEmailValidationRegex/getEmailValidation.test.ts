import { ZodError } from 'zod'
import { CommaSeparatedEmailsValidationSchema } from './getEmailValidation'

describe('CommaSeparatedEmailsValidationSchema', () => {
  test('should throw a ZodError when email address is invalid', async () => {
    expect(() => {
      const res = CommaSeparatedEmailsValidationSchema.safeParse(
        'invalid-email-address'
      )

      if (!res.success) {
        console.log(JSON.stringify(res.error.issues, null, 2))
        throw new ZodError(res.error.issues)
      }
    }).toThrow(ZodError)
  })

  test('should work with undefined', async () => {
    const res = CommaSeparatedEmailsValidationSchema.safeParse(undefined)
    expect(res.data).toEqual([])
  })

  test('should work with an empty string', async () => {
    const res = CommaSeparatedEmailsValidationSchema.safeParse('')
    expect(res.data).toEqual([])
  })

  test('should work with multiple empty strings', async () => {
    const res = CommaSeparatedEmailsValidationSchema.safeParse(',')
    expect(res.data).toEqual([])
  })

  test('should work with valid and empty strings', async () => {
    const res = CommaSeparatedEmailsValidationSchema.safeParse(
      'hello@world.com,   , hello-2@world.com'
    )
    expect(res.data).toEqual(['hello@world.com', 'hello-2@world.com'])
  })

  test('should work with a single email address', async () => {
    const res = CommaSeparatedEmailsValidationSchema.parse('hello@world.com')
    expect(res).toEqual(['hello@world.com'])
  })

  test('should work with multiple email addresses', async () => {
    const res = CommaSeparatedEmailsValidationSchema.safeParse(
      'hello-1@world.com, hello-2@world.com'
    )
    expect(res.data).toEqual(['hello-1@world.com', 'hello-2@world.com'])
  })

  test('should work with multiple email addresses and various whitespaces', async () => {
    const res = CommaSeparatedEmailsValidationSchema.safeParse(
      '   hello-1@world.com    ,      hello-2@world.com     '
    )
    expect(res.data).toEqual(['hello-1@world.com', 'hello-2@world.com'])
  })
})
