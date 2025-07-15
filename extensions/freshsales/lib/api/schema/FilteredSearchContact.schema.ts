import { z } from 'zod'

export const FilteredSearchContactInputSchema = z.object({
  filter_rule: z.array(
    z.object({
      attribute: z.string(),
      operator: z.union([z.literal('is_in'), z.literal('equals')]),
      value: z.string(),
    }),
  ),
})

export type FilteredSearchContactInputType = z.infer<
  typeof FilteredSearchContactInputSchema
>

export const FilteredSearchContactResponseSchema = z.object({
  contacts: z.array(
    z.object({
      partial: z.boolean(),
      id: z.number(),
      job_title: z.string().optional().nullable(),
      lead_score: z.number(),
      email: z.string(),
      work_number: z.string().optional().nullable(),
      mobile_number: z.string().optional().nullable(),
      open_deals_amount: z.string().optional().nullable(),
      display_name: z.string().optional().nullable(),
      avatar: z.string().optional().nullable(),
      last_contacted_mode: z.string().optional().nullable(),
      last_contacted: z.string().optional().nullable(),
      first_name: z.string().optional().nullable(),
      last_name: z.string().optional().nullable(),
      city: z.string().optional().nullable(),
      country: z.string().optional().nullable(),
      created_at: z.string(),
      updated_at: z.string(),
    }),
  ),
  meta: z.object({
    total: z.number(),
  }),
})

export type FilteredSearchContactResponseType = z.infer<
  typeof FilteredSearchContactResponseSchema
>
