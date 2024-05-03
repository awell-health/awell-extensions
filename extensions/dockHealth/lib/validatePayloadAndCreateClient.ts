import { validate } from '@awell-health/extensions-core'
import z from 'zod'
import { DockAPIClient } from '../api/client'
import {
  API_URLS,
  AUTH_URLS,
  DockApiScopes,
  DockSettingsSchema,
} from './dock.types'

type ValidateAndCreateClient = <T extends z.ZodTypeAny>(args: {
  fieldsSchema: T
  payload: unknown
}) => Promise<{
  dockClient: DockAPIClient
  fields: z.infer<(typeof args)['fieldsSchema']>
  settings: z.infer<typeof DockSettingsSchema>
  pathwayId: string
  activityId: string
}>

export const validatePayloadAndCreateClient: ValidateAndCreateClient = async ({
  fieldsSchema,
  payload,
}) => {
  const {
    settings: {
      environment,
      clientId,
      clientSecret,
      apiKey,
      organizationId,
      userId,
    },
    pathway: { id: pathwayId },
    activity: { id: activityId },
    fields,
    settings,
  } = validate({
    schema: z.object({
      fields: fieldsSchema,
      settings: DockSettingsSchema,
      pathway: z.object({ id: z.string() }),
      activity: z.object({ id: z.string() }),
    }),
    payload,
  })

  const dockClient = new DockAPIClient({
    authUrl: AUTH_URLS[environment],
    baseUrl: API_URLS[environment],
    requestConfig: {
      client_id: clientId,
      client_secret: clientSecret,
      scope: DockApiScopes,
    },
    apiKey,
    organizationId,
    userId,
  })

  return { dockClient, fields, settings, pathwayId, activityId }
}
