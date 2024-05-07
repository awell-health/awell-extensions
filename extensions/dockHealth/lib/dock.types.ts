import { z } from 'zod'

export const DockEnvironmentSchema = z
  .string()
  .min(1)
  .toUpperCase()
  .pipe(z.enum(['DEVELOPMENT', 'PRODUCTION']))

export type DockEnvironment = z.infer<typeof DockEnvironmentSchema>

export const AUTH_URLS: Record<DockEnvironment, string> = {
  PRODUCTION: 'https://partner-auth.dock.health/oauth2/token',
  DEVELOPMENT: 'https://partner-auth-dev.dockhealth.app/oauth2/token',
}

export const API_URLS: Record<DockEnvironment, string> = {
  PRODUCTION: 'https://partner-api.dock.health',
  DEVELOPMENT: 'https://partner-api-dev.dockhealth.app',
}

/**
 * The scopes we need to to execute all actions in this extension
 */
const scopesArray = [
  'dockhealth/user.all.read',
  'dockhealth/user.all.write',
  'dockhealth/patient.all.read',
  'dockhealth/patient.all.write',
]

export const DockApiScopes = scopesArray.join(' ')

export const DockSettingsSchema = z.object({
  environment: DockEnvironmentSchema,
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  apiKey: z.string().min(1),
  organizationId: z.string().min(1),
  userId: z.string().min(1),
})
