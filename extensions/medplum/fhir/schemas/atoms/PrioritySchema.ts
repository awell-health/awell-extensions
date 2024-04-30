import { z } from 'zod'

export const PrioritySchema = z.union([
  z.literal('routine'),
  z.literal('urgent'),
  z.literal('asap'),
  z.literal('stat'),
])
