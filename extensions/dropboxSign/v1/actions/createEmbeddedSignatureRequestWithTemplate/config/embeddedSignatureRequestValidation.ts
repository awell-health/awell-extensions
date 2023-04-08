import { z } from 'zod'

export const ResponseValidationSchema = z.object({
  body: z.object({
    signatureRequest: z.object({
      signatures: z
        .object({
          signatureId: z.string(),
        })
        .array()
        .length(1),
    }),
  }),
})

export const validateEmbeddedSignatureRequestResponse = (
  fields: unknown
): z.infer<typeof ResponseValidationSchema> => {
  const parsedData = ResponseValidationSchema.parse(fields)

  return parsedData
}
