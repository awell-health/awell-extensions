import { z } from 'zod'

export const EventType = z.enum(['person', 'object', 'delivery'])
