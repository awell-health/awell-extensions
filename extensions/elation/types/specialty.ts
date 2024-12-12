import { type z } from 'zod'
import { type specialtySchema } from '../validation/specialty.zod'

export type ElationSpecialty = z.infer<typeof specialtySchema>
