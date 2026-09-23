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
      // From zod 4.5.0 a schema-level `error` is the default for EVERY issue on
      // that schema, not just invalid_type -- so `error: 'Missing patientId'`
      // now answers the .min(1) violation too, where 4.4.3 fell back to
      // "Too small: expected string to have >=1 characters". The issue code is
      // unchanged, so only the human-readable text moves. That reads better
      // here: an empty required patientId IS missing. To get a distinct message
      // per constraint, pass one to the constraint itself --
      // `z.string({ error: 'A' }).min(1, { error: 'B' })` still yields 'B'.
      expect(issue?.message).toBe('Missing patientId')
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
