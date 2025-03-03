import { z } from 'zod'

export const BroadcastTypes = z.enum(['Announcement', 'Survey'])
