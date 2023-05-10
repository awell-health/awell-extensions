import { validateCommaSeparatedList } from '../generic'
import { NumericIdSchema } from '../schemas'

describe('Test comma-separated string validation', () => {
  describe('General', () => {
    test('Should return array when `returnArray` is set to true', async () => {
      const validator = validateCommaSeparatedList(
        (value) => NumericIdSchema.safeParse(value).success,
        true
      )

      const actual = validator.parse('1,2,3')

      expect(actual).toEqual(['1', '2', '3'])
    })

    test('Should return string when `returnArray` is set to false', async () => {
      const validator = validateCommaSeparatedList(
        (value) => NumericIdSchema.safeParse(value).success,
        false
      )

      const actual = validator.parse('1,2,3')

      expect(actual).toBe('1,2,3')
    })
  })

  describe('Comma-separated numbers (array=true)', () => {
    const validator = validateCommaSeparatedList(
      (value) => NumericIdSchema.safeParse(value).success,
      true
    )

    test.each([
      { input: '1', result: ['1'] },
      { input: '1,2', result: ['1', '2'] },
      { input: '1,', result: ['1'] },
      { input: '1,2, 3', result: ['1', '2', '3'] },
      { input: '1,2, 3, 4 ,', result: ['1', '2', '3', '4'] },
    ])(
      '$#. Should validate and return "$result" when input is "$input"',
      async ({ input, result }) => {
        const actual = validator.parse(input)

        expect(actual).toEqual(result)
      }
    )
  })

  describe('Comma-separated numbers (array=false)', () => {
    const validator = validateCommaSeparatedList(
      (value) => NumericIdSchema.safeParse(value).success,
      false
    )

    test.each([
      { input: '1', result: '1' },
      { input: '1,2', result: '1,2' },
      { input: '1,', result: '1' },
      { input: '1,2, 3', result: '1,2,3' },
      { input: '1,2, 3, 4 ,', result: '1,2,3,4' },
    ])(
      '$#. Should validate and return "$result" when input is "$input"',
      async ({ input, result }) => {
        const actual = validator.parse(input)

        expect(actual).toEqual(result)
      }
    )
  })
})
