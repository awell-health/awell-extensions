import {
  type Action,
  type DataPointDefinition,
  type Field,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../settings'
import { ApigeeApiClient } from '../client'

const fields = {} satisfies Record<string, Field>

const dataPoints = {
  proxies: {
    key: 'proxies',
    valueType: 'strings_array',
  },
  proxyCount: {
    key: 'proxyCount',
    valueType: 'number',
  },
  organizationId: {
    key: 'organizationId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const listApis: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'listApis',
  category: Category.EHR_INTEGRATIONS,
  title: 'List Apigee API Proxies',
  description: 'Lists all API proxies in the specified Apigee organization.',
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const { settings } = payload
      
      if (settings.apigeeOrgId == null || settings.apigeeOrgId.trim() === '') {
        throw new Error('Apigee Organization ID is required')
      }
      
      const client = new ApigeeApiClient()
      const response = await client.listApis(settings.apigeeOrgId)

      await onComplete({
        data_points: {
          proxies: JSON.stringify(response.proxies),
          proxyCount: String(response.proxies.length),
          organizationId: settings.apigeeOrgId,
        },
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: `Failed to list Apigee APIs: ${errorMessage}` },
            error: {
              category: 'SERVER_ERROR',
              message: errorMessage,
            },
          },
        ],
      })
    }
  },
}
