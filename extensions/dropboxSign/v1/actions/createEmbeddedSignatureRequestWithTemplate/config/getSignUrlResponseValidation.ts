import { formatISO, fromUnixTime } from 'date-fns'
import { z } from 'zod'

export const ResponseValidationSchema = z.object({
  body: z.object({
    embedded: z.object({
      signUrl: z.string().url(),
      expiresAt: z
        .number()
        .transform((unixTimestamp) => fromUnixTime(unixTimestamp))
        .transform((date) => formatISO(date)),
    }),
  }),
})

export const validateGetSignUrlResponse = (
  fields: unknown
): z.infer<typeof ResponseValidationSchema> => {
  const parsedData = ResponseValidationSchema.parse(fields)

  return parsedData
}
