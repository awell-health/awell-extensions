import { ZodError } from 'zod'
import { freshsalesMobilePhoneToE164 } from './freshsalesMobilePhoneToE164'

describe('freshsalesMobilePhoneToE164', () => {
  describe('when the phone number is already in the E164 format', () => {
    it('should return the phone number as is', () => {
      expect(freshsalesMobilePhoneToE164('+19266529503')).toBe('+19266529503')
    })
  })

  describe('when the phone number is the classic Freshsales format', () => {
    it('should return the correct E164 format', () => {
      expect(freshsalesMobilePhoneToE164('1-926-652-9503')).toBe('+19266529503')
    })
  })

  describe('when the phone number is in a format we cannot parse', () => {
    it('should throw a ZodError', () => {
      expect(() => freshsalesMobilePhoneToE164('hello world')).toThrow(ZodError)
    })
  })
})
