import { rateLimitDurationSchema } from '../settings'

describe('rateLimitDurationSchema', () => {
  it.each([
    ['1 s', { value: 1, unit: 'seconds' }],
    ['5 m', { value: 5, unit: 'minutes' }],
    ['12 h', { value: 12, unit: 'hours' }],
    ['86400 m', { value: 86400, unit: 'minutes' }],
    ['30 d', { value: 30, unit: 'days' }],
    ['10 seconds', { value: 10, unit: 'seconds' }],
    ['10 minutes', { value: 10, unit: 'minutes' }],
    ['10 hours', { value: 10, unit: 'hours' }],
    ['10 days', { value: 10, unit: 'days' }],
    [undefined, undefined],
  ])(
    'should validate rate limit correctly %s',
    async (rateLimitDuration, expected) => {
      const settings = {
        rateLimitDuration,
      }
      const validatedRateLimit = rateLimitDurationSchema.parse(
        settings.rateLimitDuration,
      )
      expect(validatedRateLimit).toStrictEqual(expected)
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
