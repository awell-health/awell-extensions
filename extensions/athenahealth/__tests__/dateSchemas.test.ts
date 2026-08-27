import {
  AwellToAthenaDateOnlySchema,
  AwellToAthenaDateOnlyOptionalSchema,
} from '../validation/date'
import {
  AthenaDateOnlySchema,
  AthenaDateOnlyOptionalSchema,
} from '../api/schema/date'

describe('athenahealth date schemas (zod 4 invalid_format issues)', () => {
  describe('AwellToAthenaDateOnlySchema (ISO -> MM/dd/yyyy)', () => {
    it('transforms a valid ISO date', () => {
      expect(AwellToAthenaDateOnlySchema.parse('2024-01-15')).toBe('01/15/2024')
    })

    it('emits an invalid_format/date issue for garbage', () => {
      const result = AwellToAthenaDateOnlySchema.safeParse('not-a-date')
      expect(result.success).toBe(false)
      expect(result.error?.issues).toHaveLength(1)
      expect(result.error?.issues[0]).toMatchObject({
        code: 'invalid_format',
        format: 'date',
        message: 'No valid date',
      })
    })

    it('optional variant passes through undefined and empty string', () => {
      expect(
        AwellToAthenaDateOnlyOptionalSchema.parse(undefined),
      ).toBeUndefined()
      expect(AwellToAthenaDateOnlyOptionalSchema.parse('')).toBeUndefined()
      expect(AwellToAthenaDateOnlyOptionalSchema.parse('2024-01-15')).toBe(
        '01/15/2024',
      )
    })
  })

  describe('AthenaDateOnlySchema (MM/dd/yyyy -> ISO)', () => {
    it('transforms a valid athena date', () => {
      expect(AthenaDateOnlySchema.parse('01/15/2024')).toBe('2024-01-15')
    })

    it('emits an invalid_format/date issue for garbage', () => {
      const result = AthenaDateOnlySchema.safeParse('not-a-date')
      expect(result.success).toBe(false)
      expect(result.error?.issues).toHaveLength(1)
      expect(result.error?.issues[0]).toMatchObject({
        code: 'invalid_format',
        format: 'date',
        message: 'Not able to parse athena date',
      })
    })

    it('optional variant passes through undefined and empty string', () => {
      expect(AthenaDateOnlyOptionalSchema.parse(undefined)).toBeUndefined()
      expect(AthenaDateOnlyOptionalSchema.parse('')).toBeUndefined()
    })
  })
})
