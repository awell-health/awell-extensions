import { z } from 'zod'

export const GenderSchema = z.enum(['male', 'female', 'other', 'unknown'])
