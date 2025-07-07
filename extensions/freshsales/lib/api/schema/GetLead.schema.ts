import { z } from 'zod'

export const GetLeadResponseSchema = z.object({
  lead: z.object({
    id: z.number(),
    job_title: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    work_number: z.string().optional().nullable(),
    mobile_number: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    zipcode: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    time_zone: z.string().optional().nullable(),
    display_name: z.string().optional().nullable(),
    avatar: z.string().optional().nullable(),
    keyword: z.string().optional().nullable(),
    medium: z.string().optional().nullable(),
    last_seen: z.string().optional().nullable(),
    last_contacted: z.string().optional().nullable(),
    lead_score: z.number().optional().nullable(),
    stage_updated_time: z.string().optional().nullable(),
    first_name: z.string(),
    last_name: z.string(),
    company: z
      .object({
        id: z.number().optional().nullable(),
        name: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
        city: z.string().optional().nullable(),
        state: z.string().optional().nullable(),
        zipcode: z.string().optional().nullable(),
        country: z.string().optional().nullable(),
        number_of_employees: z.number().optional().nullable(),
        annual_revenue: z.number().optional().nullable(),
        website: z.string().optional().nullable(),
        phone: z.string().optional().nullable(),
        industry_type_id: z.number().optional().nullable(),
        business_type_id: z.number().optional().nullable(),
      })
      .optional()
      .nullable(),
    deal: z.unknown().optional().nullable(),
    links: z.unknown().optional().nullable(),
    updated_at: z.string(),
    facebook: z.string().optional().nullable(),
    twitter: z.string().nullable(),
    linkedin: z.string().nullable(),
  }),
})

export type GetLeadResponseType = z.infer<typeof GetLeadResponseSchema>
