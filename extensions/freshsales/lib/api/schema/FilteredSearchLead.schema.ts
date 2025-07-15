import { z } from 'zod'
import { LeadSchema } from './atoms'

export const FilteredSearchLeadInputSchema = z.object({
  filter_rule: z.array(
    z.object({
      attribute: z.string(),
      operator: z.union([z.literal('is_in'), z.literal('equals')]),
      value: z.string(),
    }),
  ),
})

export type FilteredSearchLeadInputType = z.infer<
  typeof FilteredSearchLeadInputSchema
>

export const FilteredSearchLeadResponseSchema = z.object({
  leads: z.array(
    LeadSchema.pick({
      id: true,
      job_title: true,
      lead_score: true,
      last_contacted_mode: true,
      email: true,
      emails: true,
      work_number: true,
      mobile_number: true,
      display_name: true,
      avatar: true,
      company: true,
      last_contacted: true,
      stage_updated_time: true,
      first_name: true,
      last_name: true,
      city: true,
      country: true,
      created_at: true,
      updated_at: true,
      recent_note: true,
      last_contacted_via_sales_activity: true,
      last_contacted_sales_activity_mode: true,
      facebook: true,
      twitter: true,
      linkedin: true,
      record_type_id: true,
      web_form_ids: true,
      last_assigned_at: true,
    }),
  ),
  meta: z.object({
    total: z.number(),
  }),
})

export type FilteredSearchLeadResponseType = z.infer<
  typeof FilteredSearchLeadResponseSchema
>
