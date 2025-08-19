import {
  type Action,
  type DataPointDefinition,
  type Field,
  FieldType,
} from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../settings'
import { ApigeeApiClient } from '../client'

const fields = {
  developerId: {
    id: 'developerId',
    label: 'Developer ID',
    description: 'ID or email of the developer',
    type: FieldType.STRING,
    required: true,
  },
  appName: {
    id: 'appName',
    label: 'Application Name',
    description: 'Name of the developer application',
    type: FieldType.STRING,
    required: true,
  },
  apiProducts: {
    id: 'apiProducts',
    label: 'API Products',
    description: 'Comma-separated list of API product names to bind to the app',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

const dataPoints = {
  appId: {
    key: 'appId',
    valueType: 'string',
  },
  keyId: {
    key: 'keyId',
    valueType: 'string',
  },
  consumerKey: {
    key: 'consumerKey',
    valueType: 'string',
  },
  boundProducts: {
    key: 'boundProducts',
    valueType: 'strings_array',
  },
  organizationId: {
    key: 'organizationId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const createDeveloperAppAndApproveKey: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createDeveloperAppAndApproveKey',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create Developer App and Approve Key',
  description: 'Creates a developer application with API key and binds it to specified API products. Idempotent operation.',
  fields,
  previewable: false,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const { settings, fields } = payload
      
      if (settings.apigeeOrgId == null || settings.apigeeOrgId.trim() === '') {
        throw new Error('Apigee Organization ID is required')
      }
      
      const apiProducts = (fields.apiProducts ?? '').split(',').map((p: string) => p.trim())
      
      const client = new ApigeeApiClient()
      const response = await client.createDeveloperAppAndApproveKey(
        settings.apigeeOrgId,
        fields.developerId ?? '',
        fields.appName ?? '',
        apiProducts
      )

      await onComplete({
        data_points: {
          appId: response.appId,
          keyId: response.keyId,
          consumerKey: response.consumerKey,
          boundProducts: JSON.stringify(response.boundProducts),
          organizationId: settings.apigeeOrgId,
        },
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: `Failed to create developer app: ${errorMessage}` },
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
