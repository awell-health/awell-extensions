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
  apiProducts: {
    key: 'apiProducts',
    valueType: 'strings_array',
  },
  productCount: {
    key: 'productCount',
    valueType: 'number',
  },
  organizationId: {
    key: 'organizationId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const listApiProducts: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'listApiProducts',
  category: Category.EHR_INTEGRATIONS,
  title: 'List API Products',
  description: 'Lists all API products in the organization with their configuration details.',
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
      const response = await client.listApiProducts(settings.apigeeOrgId)

      const productNames = response.apiProducts.map(product => product.name)

      await onComplete({
        data_points: {
          apiProducts: JSON.stringify(productNames),
          productCount: String(response.apiProducts.length),
          organizationId: settings.apigeeOrgId,
        },
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: `Failed to list Apigee API products: ${errorMessage}` },
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
