import { AwellToAthenaDateOnlySchema } from './date'

describe('athenahealth action field validation', () => {
  describe('From ISO8601 date to athenahealth date', () => {
    test('1993-11-30 should be parsed to DD/mm/yyyy', () => {
      const date = AwellToAthenaDateOnlySchema.parse('1993-11-30')
      expect(date).toBe('11/30/1993')
    })
  })
})
