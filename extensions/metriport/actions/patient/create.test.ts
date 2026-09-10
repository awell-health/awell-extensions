import { convertToMetriportPatient } from './create'
import { patientCreateSchema } from './validation'

const baseFields = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  dob: '1940-08-29',
  genderAtBirth: 'F',
  addressLine1: '1 Analytical Engine Way',
  city: 'San Francisco',
  state: 'CA',
  zip: '94105',
}

const convert = (
  overrides: Record<string, unknown>,
): ReturnType<typeof convertToMetriportPatient> =>
  convertToMetriportPatient(
    patientCreateSchema.parse({ ...baseFields, ...overrides }),
  )

describe('convertToMetriportPatient.contact', () => {
  test('includes phone and email when both are provided', () => {
    expect(
      convert({ phone: '+15555550100', email: 'ada@example.com' }).contact,
    ).toEqual({ phone: '+15555550100', email: 'ada@example.com' })
  })

  test('includes only the phone when the email is empty', () => {
    expect(convert({ phone: '+15555550100', email: '' }).contact).toEqual({
      phone: '+15555550100',
      email: undefined,
    })
  })

  test('includes only the email when the phone is missing', () => {
    expect(convert({ email: 'ada@example.com' }).contact).toEqual({
      phone: undefined,
      email: 'ada@example.com',
    })
  })

  test.each([
    ['both are missing', {}],
    ['both are empty strings', { phone: '', email: '' }],
    ['phone is empty and email is missing', { phone: '' }],
  ])('omits contact when %s', (_label, overrides) => {
    expect(convert(overrides)).not.toHaveProperty('contact')
  })
})
