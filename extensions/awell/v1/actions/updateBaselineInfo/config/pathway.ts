import z from 'zod'

export const PathwayValidationSchema = z.object({ id: z.string() })
