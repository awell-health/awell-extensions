import { z } from 'zod'

export const StatusSchema = z.enum(['final', 'preliminary'])
