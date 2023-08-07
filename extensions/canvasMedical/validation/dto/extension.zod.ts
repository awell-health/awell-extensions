import { z } from 'zod'

export interface IExtension {
  url: string
  valueString?: string
  valueBoolean?: boolean
  valueInteger?: number
  valueCode?: string
  extension?: IExtension[]
}

export const extensionSchema: z.ZodType<IExtension> = z.lazy(() =>
  z.object({
    url: z.string(),
    valueString: z.string().optional(),
    valueBoolean: z.boolean().optional(),
    valueInteger: z.number().int().optional(),
    valueCode: z.string().optional(),
    extension: z.array(extensionSchema).optional(),
  })
)

export type FHIRExtension = z.infer<typeof extensionSchema>
