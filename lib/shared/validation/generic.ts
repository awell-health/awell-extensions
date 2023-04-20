import { z } from 'zod'

/**
 * Allows `undefined` and empty strings `''` to be used as a valid value for a string schema.
 */
export const makeStringOptional = <T extends z.ZodTypeAny>(
  schema: T
): z.ZodUnion<
  [z.ZodOptional<T>, z.ZodEffects<z.ZodLiteral<''>, undefined, ''>]
> => z.union([schema.optional(), z.literal('').transform(() => undefined)])
