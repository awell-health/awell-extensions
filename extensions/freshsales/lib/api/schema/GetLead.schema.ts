import { z } from 'zod'

export const GetLeadResponseSchema = z.object({
  lead: z.object({
    id: z.number(),
    job_title: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    emails: z
      .array(
        z.object({
          id: z.number(),
          value: z.string(),
          is_primary: z.boolean(),
          label: z.string().optional().nullable(),
          _destroy: z.boolean(),
        }),
      )
      .optional()
      .nullable(),
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
    custom_field: z
      .record(
        z.string(),
        z.union([z.string(), z.number(), z.boolean(), z.null()]),
      )
      .optional()
      .nullable(),
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
    last_contacted_sales_activity_mode: z.unknown().optional().nullable(),
    last_contacted_mode: z.unknown().optional().nullable(),
    recent_note: z.unknown().optional().nullable(),
    last_contacted_via_sales_activity: z.unknown().optional().nullable(),
    completed_sales_sequences: z.string().optional().nullable(),
    active_sales_sequences: z.unknown().optional().nullable(),
    web_form_ids: z.unknown().optional().nullable(),
    created_at: z.string(),
    updated_at: z.string().optional().nullable(),
    last_assigned_at: z.string().optional().nullable(),
    facebook: z.string().optional().nullable(),
    twitter: z.string().nullable(),
    linkedin: z.string().nullable(),
    is_deleted: z.boolean(),
    team_user_ids: z.array(z.unknown()).optional().nullable(),
    subscription_status: z.number().optional().nullable(),
    record_type_id: z.string().optional().nullable(),
    phone_numbers: z.array(z.unknown()).optional().nullable(),
    tags: z.array(z.unknown()).optional().nullable(),
  }),
  meta: z.record(z.string(), z.unknown()).optional().nullable(),
})

export type GetLeadResponseType = z.infer<typeof GetLeadResponseSchema>
