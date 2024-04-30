import { z } from 'zod'

export const GenderSchema = z.union([
  z.literal('male'),
  z.literal('female'),
  z.literal('other'),
  z.literal('unknown'),
])
