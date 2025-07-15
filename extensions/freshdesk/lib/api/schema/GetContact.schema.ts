import { z } from 'zod'

export const GetContactResponseSchema = z.object({
  active: z.boolean().optional().nullable(),
  address: z.string().optional().nullable(),
  company_id: z.number().optional().nullable(),
  view_all_tickets: z.boolean().optional().nullable(),
  description: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  id: z.number(),
  unique_external_id: z.string().optional().nullable(),
  job_title: z.string().nullable(),
  language: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  name: z.string(),
  phone: z.string().optional().nullable(),
  time_zone: z.string().optional().nullable(),
  other_emails: z.array(z.string()).optional().nullable(),
  other_companies: z
    .array(
      z.object({
        company_id: z.number(),
        view_all_tickets: z.boolean(),
      }),
    )
    .optional()
    .nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  twitter_id: z.string().optional().nullable(),
  facebook_id: z.string().optional().nullable(),
  csat_rating: z.unknown().optional().nullable(),
  preferred_source: z.string().optional().nullable(),
  twitter_profile_status: z.unknown().optional().nullable(),
  twitter_followers_count: z.number().optional().nullable(),
  custom_fields: z
    .record(
      z.string(),
      z.union([z.string(), z.number(), z.boolean(), z.null()]),
    )
    .optional()
    .nullable(),
  tags: z.array(z.string()).optional().nullable(),
  avatar: z.unknown().optional().nullable(),
})

export type GetContactResponseType = z.infer<typeof GetContactResponseSchema>
