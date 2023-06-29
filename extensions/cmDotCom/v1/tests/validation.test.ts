import { FromNameValidationSchema } from '../validation'

describe('From name validation', () => {
  test.each([
    { value: '1' },
    { value: '123456789' },
    { value: '0123456789123456' },
    { value: 'abc' },
    { value: 'abc123def45' },
  ])('$#. Should validate when value equals "$value"', async ({ value }) => {
    expect(() => {
      FromNameValidationSchema.parse(value)
    }).not.toThrow()
  })

  test.each([
    { value: '' },
    { value: '01234567891234567' },
    { value: 'abc123def456' },
  ])('$#. Should throw when value equals "$value"', async ({ value }) => {
    expect(() => {
      FromNameValidationSchema.parse(value)
    }).toThrow()
  })
})
