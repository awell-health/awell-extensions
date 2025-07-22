import { z } from 'zod'

export const GetFaxDocumentInputSchema = z.object({
  Username: z.string().min(1),
  Password: z.string().min(1),
  Cookies: z.boolean(),
  ProductId: z.string().min(1),
  FaxIds1: z.object({
    Id: z.string(),
    Direction: z.string().optional(),
  }),
  format: z.enum(['pdf', 'tiff', 'jpeg', 'png', 'gif']),
})

const GetFaxInputSchemaWithoutCredentials = GetFaxDocumentInputSchema.pick({
  Cookies: true,
  FaxIds1: true,
  format: true,
})

export type GetFaxInputTypeWithoutCredentials = z.infer<
  typeof GetFaxInputSchemaWithoutCredentials
>

export const GetFaxDocumentResponseSchema = z.object({
  Success: z.boolean(),
  Result: z.array(
    z.object({
      Id: z.string(),
      Direction: z.string(),
      Date: z.string(),
      Status: z.string(),
      FaxFiles: z.array(
        z.object({
          ContentType: z.string(),
          ContentLength: z.number(),
          FileContents: z.string(),
        }),
      ),
      Format: z.string(),
      PageCount: z.number(),
    }),
  ),
})

export type GetFaxDocumentResponseType = z.infer<
  typeof GetFaxDocumentResponseSchema
>
