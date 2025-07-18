import { z } from 'zod'

export const AgenticDocumentAnalysisInputSchema = z.object({
  query: z
    .object({
      pages: z.string().nullable(),
      timeout: z.number().nullable(),
    })
    .optional()
    .nullable(),
  body: z.object({
    image: z.string().nullable(),
    pdf: z.string().nullable(),
    include_marginalia: z.boolean().default(true),
    include_metadata_in_markdown: z.boolean().default(true),
    fields_schema: z.string().nullable(),
  }),
})

export type AgenticDocumentAnalysisInputType = z.infer<
  typeof AgenticDocumentAnalysisInputSchema
>

export const AgenticDocumentAnalysisResponseSchema = z.object({
  data: z.object({
    markdown: z.string(),
    chunks: z.array(
      z.object({
        text: z.string(),
        chunk_type: z.any(),
        chunk_id: z.string(),
        grounding: z.array(z.any()).nullable(),
      }),
    ),
    extracted_schema: z.record(z.string(), z.any()).nullable(),
    extraction_metadata: z.record(z.string(), z.any()).nullable(),
  }),
  errors: z.array(z.unknown()),
  extraction_error: z.string().nullable(),
})

export type AgenticDocumentAnalysisResponseType = z.infer<
  typeof AgenticDocumentAnalysisResponseSchema
>
