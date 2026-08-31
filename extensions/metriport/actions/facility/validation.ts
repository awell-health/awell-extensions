import { z } from 'zod'

export const getByNameSchema = z.object({
  facilityName: z.coerce
    .string({ error: 'Requires a Facility name' })
    .trim()
    .min(1, 'Requires a Facility name'),
})
