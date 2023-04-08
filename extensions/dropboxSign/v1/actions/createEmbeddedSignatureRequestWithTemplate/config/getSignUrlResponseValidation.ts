import { z } from 'zod'

export const ResponseValidationSchema = z.object({
  body: z.object({
    embedded: z.object({
      signUrl: z.string().url(),
    }),
  }),
})

export const validateGetSignUrlResponse = (
  fields: unknown
): z.infer<typeof ResponseValidationSchema> => {
  const parsedData = ResponseValidationSchema.parse(fields)

  return parsedData
}
