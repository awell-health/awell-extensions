import { z, type ZodTypeAny } from 'zod'
import { type settings } from '../../../config/settings'
export const SettingsValidationSchema = z.object({
  platformApiKey: z.string().optional(),
  platformApiUrl: z.string().optional(),
  apiUrl: z.string().optional(),
  apiKey: z.string().optional(),
  selectEventTypeQuestion: z.string().optional(),
  startSendingRemindersQuestions: z.string().optional(),
  memberEventFormId: z.string().optional(),
  flourishApiKey: z.string(),
  flourishApiUrl: z.string(),
  flourishClientExtId: z.string(),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
