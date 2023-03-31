import { z } from 'zod'

export const settingsSchema = z.object({
    client_id: z.string().min(1, { message: 'Missing client_id' }),
    client_secret: z.string().min(1, { message: 'Missing client_secret' }),
    username: z.string().min(1, { message: 'Missing username' }),
    password: z.string().min(1, { message: 'Missing password' }),
})