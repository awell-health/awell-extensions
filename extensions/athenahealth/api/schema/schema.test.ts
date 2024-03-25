import { ZodError } from 'zod'
import { AthenaDateOnlySchema } from './date'

describe('athenahealth schema tests', () => {
  describe('From athenahealth date to ISO date', () => {
    test('01/02/2024 (January 2, 2024) should be parsed to the correct ISO format', () => {
      const date = AthenaDateOnlySchema.parse('01/02/2024')
      expect(date).toBe('2024-01-02')
    })

    test('11/30/1993 (November 30, 1993) should be parsed to the correct ISO format', () => {
      const date = AthenaDateOnlySchema.parse('11/30/1993')
      expect(date).toBe('1993-11-30')
    })

    test('invalid date should throw an error', async () => {
      expect(() => {
        AthenaDateOnlySchema.parse('11/33/1993')
      }).toThrow(ZodError)
    })
  })
})
