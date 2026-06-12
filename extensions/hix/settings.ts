import { type Setting } from '@awell-health/extensions-core'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  apiUrl: {
    label: 'API URL',
    key: 'apiUrl',
    obfuscated: false,
    required: true,
    description:
      'The full URL of the HiX task endpoint (e.g. the "incoming-task" endpoint of the demo environment).',
  },
  tasksIngestToken: {
    label: 'Tasks ingest token',
    key: 'tasksIngestToken',
    obfuscated: true,
    required: true,
    description:
      'Bearer token sent as the "Authorization" header on every request. Must match the TASKS_INGEST_TOKEN secret configured on the endpoint.',
  },
} satisfies Record<string, Setting>

export const SettingsValidationSchema = z.object({
  apiUrl: z.string().url({ message: 'API URL must be a valid URL' }),
  tasksIngestToken: z.string().min(1),
} satisfies Record<keyof typeof settings, ZodTypeAny>)
