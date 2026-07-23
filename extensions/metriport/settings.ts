import type { RateLimitConfig, Setting } from '@awell-health/extensions-core'
import { isEmpty, isFinite, isNil } from 'lodash'
import { z } from 'zod'

export const settings = {
  apiKey: {
    key: 'apiKey',
    label: 'API Key',
    obfuscated: true,
    description: 'The API Key for the Metriport Medical API.',
    required: true,
  },
  baseUrl: {
    key: 'baseUrl',
    label: 'Base URL',
    obfuscated: false,
    description: 'The base URL of the Metriport Medical API.',
    required: false,
  },
  webhookKey: {
    key: 'webhookKey',
    label: 'Webhook Key',
    obfuscated: true,
    description:
      'The Metriport webhook key used to verify incoming webhook requests. Metriport signs each request with an HMAC-SHA256 of the raw body using this key, sent in the `x-metriport-signature` header. Found in the Settings/Developers tab of the Metriport dashboard. When left empty, incoming webhook requests are not verified.',
    required: false,
  },
  rateLimitDuration: {
    key: 'rateLimitDuration',
    label: 'Rate Limit Duration',
    obfuscated: false,
    description:
      "Rate limit Metriport enrollment webhooks at a certain duration (e.g. only enroll once for a given webhook message every '30 s', '1 m', '12 h', '30 d'). Prevents duplicate deliveries of the same message from re-enrolling a patient. Value should be {number} {unit}.",
    required: false,
  },
} satisfies Record<string, Setting>

export const rateLimitDurationSchema = z.string().refine(
  (val) => {
    if (isNil(val) || isEmpty(val)) {
      return true
    }
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

const parseDurationUnit = (
  unit: string | undefined,
): 'seconds' | 'minutes' | 'hours' | 'days' => {
  if (isNil(unit) || isEmpty(unit))
    throw new Error('Duration unit is required')

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

export const transformRateLimitDuration = (
  val: string,
): RateLimitConfig['duration'] => {
  const [number, unit] = val.split(' ')
  const parsedUnit = parseDurationUnit(unit)
  return {
    value: Number(number),
    unit: parsedUnit,
  }
}
