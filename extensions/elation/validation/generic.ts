import { z } from 'zod'

export const numberId = z.coerce.number().positive()
