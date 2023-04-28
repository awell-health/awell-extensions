import { z } from 'zod'

/**
 * Allows `undefined` and empty strings `''` to be used as a valid value for a string schema.
 * Returns `undefined` in those two cases.
 */
export const makeStringOptional = <T extends z.ZodTypeAny>(
  schema: T
): z.ZodUnion<
  [z.ZodOptional<T>, z.ZodEffects<z.ZodLiteral<''>, undefined, ''>]
> => z.union([schema.optional(), z.literal('').transform(() => undefined)])

/**
 * Checks whether comma-separated list of values is valid.
 * If `shouldReturnArray` is true, transforms string to array.
 */
export const validateCommaSeparatedList = <
  ReturnArray extends boolean,
  ReturnType = ReturnArray extends true
    ? z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string[], string>
    : z.ZodEffects<z.ZodString, string, string>
>(
  possibleValuesOrValidator: string[] | ((value: string) => boolean),
  returnArray: ReturnArray = false as ReturnArray
): ReturnType => {
  const schema = z
    .string()
    .trim()
    .toLowerCase()
    .refine(
      (value) => {
        // remove any spaces and trailling comma
        const currentValues = value
          .replace(/,\s*$/, '')
          .split(',')
          .map((el) => el.trim())

        if (typeof possibleValuesOrValidator === 'function') {
          return currentValues.every(possibleValuesOrValidator)
        }

        return currentValues.every((el) =>
          possibleValuesOrValidator.includes(el)
        )
      },
      {
        message: `Should be comma-separated list of values${
          typeof possibleValuesOrValidator === 'function'
            ? ' and match validator'
            : `: ${possibleValuesOrValidator.join(', ')}`
        }`,
      }
    )

  return (
    returnArray ? schema.transform((value) => value.split(',')) : schema
  ) as ReturnType
}
