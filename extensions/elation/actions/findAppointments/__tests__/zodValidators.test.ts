import { FieldsValidationSchema } from '../config/fields'
import {
  INVALID_ISO_DATETIMES,
  VALID_ISO_DATETIMES,
} from '../../../../../tests/zodCases'

describe('elation findAppointments FieldsValidationSchema (zod 4)', () => {
  const base = { patientId: 123 }

  describe.each(['from_date', 'to_date'])('%s', (field) => {
    it.each(VALID_ISO_DATETIMES)('accepts %s', (value) => {
      const result = FieldsValidationSchema.safeParse({
        ...base,
        [field]: value,
      })
      expect(result.success).toBe(true)
    })

    it.each(INVALID_ISO_DATETIMES)('rejects %s', (value) => {
      const result = FieldsValidationSchema.safeParse({
        ...base,
        [field]: value,
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].path).toEqual([field])
    })

    it('is optional', () => {
      expect(FieldsValidationSchema.safeParse(base).success).toBe(true)
    })
  })
})
