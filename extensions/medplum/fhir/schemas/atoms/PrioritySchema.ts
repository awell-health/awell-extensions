import { z } from 'zod'

export const PrioritySchema = z.enum(['routine', 'urgent', 'asap', 'stat'])
