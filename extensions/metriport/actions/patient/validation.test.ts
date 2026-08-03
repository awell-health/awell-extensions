import {
  genderAtBirthTransformSchema,
  patientCreateSchema,
} from './validation'

describe('genderAtBirthTransformSchema', () => {
  test.each([
    ['Male', 'M'],
    ['Female', 'F'],
    ['Other', 'O'],
    ['Unknown', 'U'],
    ['NOT_KNOWN', 'U'],
    [' female ', 'F'],
    ['m', 'M'],
  ])('maps the Awell value "%s" to "%s"', (input, expected) => {
    expect(genderAtBirthTransformSchema.parse(input)).toBe(expected)
  })

  test.each(['M', 'F', 'O', 'U'])(
    'passes through the Metriport code "%s"',
    (input) => {
      expect(genderAtBirthTransformSchema.parse(input)).toBe(input)
    },
  )

  test.each(['', 'Man', 'X', undefined, null, 1])('rejects %p', (input) => {
    expect(() => genderAtBirthTransformSchema.parse(input)).toThrow()
  })
})

/**
 * The `dob` field is a `FieldType.DATE`, so orchestration hands over whatever
 * the care flow mapped onto it. Metriport only accepts a date-only string, so
 * the schema normalises on the way through. In practice we expect a plain
 * `YYYY-MM-DD`; the timestamp cases are here because a DATE field is not
 * guaranteed to be stripped of its time part upstream.
 */
const baseFields = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  genderAtBirth: 'F',
  addressLine1: '1 Analytical Engine Way',
  city: 'San Francisco',
  state: 'CA',
  zip: '94105',
}

const parseDob = (dob: unknown): string =>
  patientCreateSchema.parse({ ...baseFields, dob }).dob

describe('patientCreateSchema.dob', () => {
  test('passes a plain date through unchanged', () => {
    expect(parseDob('1940-08-29')).toBe('1940-08-29')
  })

  test('reduces an ISO timestamp to its date part', () => {
    expect(parseDob('1940-08-29T00:00:00.000Z')).toBe('1940-08-29')
  })

  test('keeps the calendar day when the timestamp has a time component', () => {
    expect(parseDob('1940-08-29T13:45:00.000Z')).toBe('1940-08-29')
  })

  test.each([
    ['an unparseable string', 'not a date'],
    ['an empty string', ''],
    ['a missing value', undefined],
  ])('rejects %s', (_label, dob) => {
    expect(() => parseDob(dob)).toThrow(
      /Requires date in valid format \(YYYY-MM-DD\)/,
    )
  })
})
