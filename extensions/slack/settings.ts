import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  botToken: {
    key: 'botToken',
    label: 'Bot Token',
    obfuscated: true,
    required: true,
    description:
      'Your Slack Bot User OAuth Token (starts with xoxb-). You can find this in your Slack App settings under "OAuth & Permissions". The bot needs the chat:write scope.',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  botToken: z.string().min(1, { message: 'Missing Slack bot token' }),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
