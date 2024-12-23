import { ZodError } from 'zod'
import { CommaSeparatedEmailsValidationSchema } from './getEmailValidation'

describe('CommaSeparatedEmailsValidationSchema', () => {
  test('should throw a ZodError when no email address is provided', async () => {
    expect(() => {
      const res = CommaSeparatedEmailsValidationSchema.safeParse('')

      if (!res.success) {
        console.log(JSON.stringify(res.error, null, 2))
        throw new ZodError(res.error.issues)
      }
    }).not.toThrow(ZodError)
  })

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
    expect(() => {
      const res = CommaSeparatedEmailsValidationSchema.safeParse(undefined)

      if (!res.success) {
        console.log(JSON.stringify(res.error, null, 2))
        throw new ZodError(res.error.issues)
      }

      expect(res.data).toEqual([])
    }).not.toThrow(ZodError)
  })

  test('should work with an empty string', async () => {
    expect(() => {
      const res = CommaSeparatedEmailsValidationSchema.safeParse('')

      if (!res.success) {
        console.log(JSON.stringify(res.error, null, 2))
        throw new ZodError(res.error.issues)
      }

      expect(res.data).toEqual([])
    }).not.toThrow(ZodError)
  })

  test('should work with a single email address', async () => {
    expect(() => {
      const res =
        CommaSeparatedEmailsValidationSchema.safeParse('hello@world.com')

      if (!res.success) {
        console.log(JSON.stringify(res.error, null, 2))
        throw new ZodError(res.error.issues)
      }

      expect(res.data).toEqual(['hello@world.com'])
    }).not.toThrow(ZodError)
  })

  test('should work with multiple email addresses', async () => {
    expect(() => {
      const res = CommaSeparatedEmailsValidationSchema.safeParse(
        'hello-1@world.com, hello-2@world.com'
      )

      if (!res.success) {
        console.log(JSON.stringify(res.error, null, 2))
        throw new ZodError(res.error.issues)
      }

      expect(res.data).toEqual(['hello-1@world.com', 'hello-2@world.com'])
    }).not.toThrow(ZodError)
  })

  test('should work with multiple email addresses and various whitespaces', async () => {
    expect(() => {
      const res = CommaSeparatedEmailsValidationSchema.safeParse(
        '   hello-1@world.com    ,      hello-2@world.com     '
      )

      if (!res.success) {
        console.log(JSON.stringify(res.error, null, 2))
        throw new ZodError(res.error.issues)
      }

      expect(res.data).toEqual(['hello-1@world.com', 'hello-2@world.com'])
    }).not.toThrow(ZodError)
  })
})
