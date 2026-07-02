import 'dotenv/config'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import type { Setting, Settings } from '@awell-health/extensions-core'

const ENV_PATH = resolve(process.cwd(), '.env')

/**
 * Convention: <EXTENSION_KEY_UPPER>_<SETTING_KEY_UPPER> maps to
 * extension.settings[settingKey]. e.g. bland + apiKey -> BLAND_APIKEY.
 */
export const envVarFor = (extensionKey: string, settingKey: string): string =>
  `${extensionKey.toUpperCase()}_${settingKey.toUpperCase()}`

export interface ResolvedSetting {
  setting: Setting
  envVar: string
  value: string | undefined
  present: boolean
}

export const resolveSettings = (
  extensionKey: string,
  settings: Settings,
): ResolvedSetting[] =>
  Object.values(settings).map((setting) => {
    const envVar = envVarFor(extensionKey, setting.key)
    const value = process.env[envVar]
    return {
      setting,
      envVar,
      value,
      present: value !== undefined && value !== '',
    }
  })

export const settingsToValues = (
  extensionKey: string,
  settings: Settings,
): Record<string, string | undefined> => {
  const out: Record<string, string | undefined> = {}
  for (const { setting, value } of resolveSettings(extensionKey, settings)) {
    out[setting.key] = value
  }
  return out
}

/** Append or update env vars in .env without revealing other values. */
export const writeEnvVars = (
  entries: Array<{ envVar: string; value: string }>,
): void => {
  if (!existsSync(ENV_PATH)) {
    writeFileSync(ENV_PATH, '')
  }
  const existing = readFileSync(ENV_PATH, 'utf8')
  const lines = existing.split('\n')
  const updated = new Map(entries.map((e) => [e.envVar, e.value]))

  const out: string[] = []
  const seen = new Set<string>()
  for (const line of lines) {
    const match = /^([A-Z0-9_]+)=/.exec(line)
    if (match !== null && updated.has(match[1])) {
      out.push(`${match[1]}=${updated.get(match[1]) ?? ''}`)
      seen.add(match[1])
    } else {
      out.push(line)
    }
  }
  // Preserve trailing newline behaviour
  const trailingNewline = existing.endsWith('\n')
  let body = out.join('\n')
  for (const [envVar, value] of updated.entries()) {
    if (seen.has(envVar)) continue
    if (body.length > 0 && !body.endsWith('\n')) body += '\n'
    body += `${envVar}=${value}\n`
  }
  if (!trailingNewline && body.endsWith('\n')) body = body.slice(0, -1)
  writeFileSync(ENV_PATH, body)
}

export const envPath = (): string => ENV_PATH
