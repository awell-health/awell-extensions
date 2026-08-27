import { getConsolidatedQueryStatusSchema } from '../actions/consolidated/getConsolidatedQueryStatus'
import { startConsolidatedQuerySchema } from '../actions/consolidated/startConsolidatedQuery'
import { startNetworkQuerySchema } from '../actions/network/startNetworkQuery'
import { startQuerySchema } from '../actions/document/validation'
import { settingsSchema } from '../validation/settings.zod'
import { DEFAULT_DEDUPE_DURATION } from '../settings'

describe('metriport patientId schemas (zod 4)', () => {
  describe.each([
    ['getConsolidatedQueryStatus', getConsolidatedQueryStatusSchema],
    ['startConsolidatedQuery', startConsolidatedQuerySchema],
    ['startNetworkQuery', startNetworkQuerySchema],
    ['document startQuery', startQuerySchema],
  ])('%s', (_, schema) => {
    it('accepts a valid patientId', () => {
      const result = schema.safeParse({ patientId: 'patient-123' })
      expect(result.success).toBe(true)
      expect(result.data?.patientId).toBe('patient-123')
    })

    it('rejects an empty patientId via .min(1)', () => {
      const result = schema.safeParse({ patientId: '' })
      expect(result.success).toBe(false)
      const issue = result.error?.issues[0]
      expect(issue?.path).toEqual(['patientId'])
      expect(issue?.code).toBe('too_small')
      // zod 4 changed the default wording from
      // "String must contain at least 1 character(s)" to
      // "Too small: expected string to have >=1 characters". The custom
      // `error: 'Missing patientId'` only applies to the invalid_type issue.
      expect(issue?.message).toMatch(/Too small/)
    })

    it('rejects a missing patientId with the custom message', () => {
      const result = schema.safeParse({})
      expect(result.success).toBe(false)
      const issue = result.error?.issues[0]
      expect(issue?.path).toEqual(['patientId'])
      expect(issue?.code).toBe('invalid_type')
      expect(issue?.message).toContain('Missing patientId')
    })
  })
})

describe('metriport settingsSchema rateLimitDuration default (zod 4)', () => {
  const base = { apiKey: 'key' }

  it('falls back to the default when undefined', () => {
    const result = settingsSchema.parse(base)
    expect(result.rateLimitDuration).toBe(DEFAULT_DEDUPE_DURATION)
    expect(result.rateLimitDuration).toBe('7 d')
  })

  it('keeps an explicit valid value', () => {
    expect(
      settingsSchema.parse({ ...base, rateLimitDuration: '30 m' })
        .rateLimitDuration,
    ).toBe('30 m')
  })

  it('keeps an empty string as-is (the refine treats empty as valid, no default applied)', () => {
    expect(
      settingsSchema.parse({ ...base, rateLimitDuration: '' })
        .rateLimitDuration,
    ).toBe('')
  })

  it('rejects a malformed duration with the documented message', () => {
    const result = settingsSchema.safeParse({
      ...base,
      rateLimitDuration: '7x',
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe(
      'Duration must be in format {number} {unit} where unit is seconds, minutes, hours or days',
    )
  })
})
