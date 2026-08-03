import { genderAtBirthTransformSchema } from './validation'

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
