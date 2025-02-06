import { RateLimitConfig, type Setting } from '@awell-health/extensions-core'
import { isFinite, isNil } from 'lodash'
import { z, type ZodTypeAny } from 'zod'

export const settings = {
  base_url: {
    key: 'base_url',
    label: 'Base URL',
    obfuscated: false,
    description: 'The base URL of Elation API.',
    required: true,
  },
  auth_url: {
    key: 'auth_url',
    label: 'Authorization URL',
    obfuscated: false,
    description: 'The complete URL of Elation authentication endpoint.',
    required: true,
  },
  client_id: {
    key: 'client_id',
    label: 'Client ID',
    obfuscated: false,
    description: 'The client ID for OAuth2 Password authentication.',
    required: true,
  },
  client_secret: {
    key: 'client_secret',
    label: 'Client Secret',
    obfuscated: true,
    description: 'The client secret for OAuth2 Password authentication.',
    required: true,
  },
  username: {
    key: 'username',
    label: 'Username',
    obfuscated: false,
    description:
      '⚠️ Deprecated: Elation now uses client credentials authentication. This setting is no longer required and should be removed from your settings.',
    required: false,
  },
  password: {
    key: 'password',
    label: 'Password',
    obfuscated: true,
    description:
      '⚠️ Deprecated: Elation now uses client credentials authentication. This setting is no longer required and should be removed from your settings.',
    required: false,
  },
  rateLimitDuration: {
    key: 'rateLimitDuration',
    label: 'Rate Limit Duration',
    obfuscated: false,
    description:
      "Rate limit Elation webhooks at a certain duration (e.g. only 1 event for a given appointment_id every '30 s', '1 m', '12 h', '30 d'). Value should be {number} {unit}.",
    required: false,
  },
} satisfies Record<string, Setting>

export const rateLimitDurationSchema = z
  .string()
  .refine(
    (val) => {
      try {
        const [number, unit] = val.split(' ')
        const parsedUnit = parseDurationUnit(unit)
        return isFinite(Number(number)) && !isNil(parsedUnit)
      } catch (error) {
        return false
      }
    },
    {
      message:
        'Duration must be in format {number} {unit} where unit is seconds, minutes, hours or days',
    },
  )
  .transform((val): RateLimitConfig['duration'] => {
    const [number, unit] = val.split(' ')
    const parsedUnit = parseDurationUnit(unit)
    return {
      value: Number(number),
      unit: parsedUnit,
    }
  })
  .optional()

export const SettingsValidationSchema = z.object({
  base_url: z.string().min(1),
  auth_url: z.string().min(1),
  client_id: z.string().min(1),
  client_secret: z.string().min(1),
  /**
   * Elation now uses client credentials authentication.
   * We don't remove the settings just yet for backward compatibility for existing care flows.
   * See https://linear.app/awell/issue/ET-577/elation-extension-make-username-and-password-optional-in-auth
   */
  username: z.string().optional(),
  password: z.string().optional(),
  rateLimitDuration: rateLimitDurationSchema,
} satisfies Record<keyof typeof settings, ZodTypeAny>)

export type SettingsType = z.infer<typeof SettingsValidationSchema>

const parseDurationUnit = (
  unit: string | undefined,
): 'seconds' | 'minutes' | 'hours' | 'days' => {
  if (!unit) throw new Error('Duration unit is required')

  const normalized = unit.toLowerCase().trim()

  switch (normalized) {
    case 's':
    case 'second':
    case 'seconds':
      return 'seconds'

    case 'm':
    case 'min':
    case 'minute':
    case 'minutes':
      return 'minutes'

    case 'h':
    case 'hour':
    case 'hours':
      return 'hours'

    case 'd':
    case 'day':
    case 'days':
      return 'days'

    default:
      throw new Error(
        `Invalid duration unit: ${unit}. Valid units are: s, m, h, d`,
      )
  }
}
