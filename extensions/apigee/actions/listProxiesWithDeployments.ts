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
  totalDeployments: {
    key: 'totalDeployments',
    valueType: 'number',
  },
  organizationId: {
    key: 'organizationId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const listProxiesWithDeployments: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'listProxiesWithDeployments',
  category: Category.EHR_INTEGRATIONS,
  title: 'List API Proxies with Deployment Status',
  description: 'Lists all API proxies in the organization with their deployment status across environments.',
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
      const response = await client.listProxiesWithDeployments(settings.apigeeOrgId)

      const proxyNames = response.proxies.map(proxy => proxy.name)
      const totalDeployments = response.proxies.reduce(
        (total, proxy) => total + proxy.deployments.length, 
        0
      )

      await onComplete({
        data_points: {
          proxies: JSON.stringify(proxyNames),
          proxyCount: String(response.proxies.length),
          totalDeployments: String(totalDeployments),
          organizationId: settings.apigeeOrgId,
        },
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: `Failed to list Apigee proxies with deployments: ${errorMessage}` },
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
