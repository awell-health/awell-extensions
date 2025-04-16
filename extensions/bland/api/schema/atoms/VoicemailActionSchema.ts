import { z } from 'zod'

export const VoicemailActionSchema = z.enum([
  'hangup',
  'leave_message',
  'ignore',
])
