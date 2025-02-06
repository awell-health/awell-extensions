import { rateLimitDurationSchema } from '../settings'

describe('rateLimitDurationSchema', () => {
  it.each([
    ['1 s', '1s'],
    ['5 m', '5m'],
    ['12 h', '12h'],
    ['86400 m', '86400m'],
    ['30 d', '30d'],
  ])(
    'should validate rate limit correctly %s',
    async (rateLimitDuration, expected) => {
      const settings = {
        rateLimitDuration,
      }
      const validatedRateLimit = rateLimitDurationSchema.parse(
        settings.rateLimitDuration,
      )
      expect(validatedRateLimit).toBe(expected)
    },
  )
  it.each(['1s', '6m', '12h', '86400m', '30d', 'invalid', ''])(
    'should fail validation %s',
    async (rateLimitDuration) => {
      const settings = {
        rateLimitDuration,
      }
      expect(() =>
        rateLimitDurationSchema.parse(settings.rateLimitDuration),
      ).toThrow()
    },
  )
})
