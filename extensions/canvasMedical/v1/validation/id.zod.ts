import { z } from 'zod'

export const idSchema = z.string().nonempty({ message: 'Missing id' })
