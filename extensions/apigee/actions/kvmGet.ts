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
  environment: {
    id: 'environment',
    label: 'Environment',
    description: 'Apigee environment name',
    type: FieldType.STRING,
    required: true,
  },
  mapName: {
    id: 'mapName',
    label: 'Map Name',
    description: 'Key-value map name',
    type: FieldType.STRING,
    required: true,
  },
  key: {
    id: 'key',
    label: 'Key',
    description: 'Key to retrieve from the map',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

const dataPoints = {
  value: {
    key: 'value',
    valueType: 'string',
  },
  key: {
    key: 'key',
    valueType: 'string',
  },
  environment: {
    key: 'environment',
    valueType: 'string',
  },
  mapName: {
    key: 'mapName',
    valueType: 'string',
  },
  organizationId: {
    key: 'organizationId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const kvmGet: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'kvmGet',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get Key-Value Map Entry',
  description: 'Retrieves a value from an environment-scoped key-value map.',
  fields,
  previewable: true,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const { settings, fields } = payload
      
      if (settings.apigeeOrgId == null || settings.apigeeOrgId.trim() === '') {
        throw new Error('Apigee Organization ID is required')
      }
      
      const client = new ApigeeApiClient()
      const response = await client.kvmGet(
        settings.apigeeOrgId,
        fields.environment ?? '',
        fields.mapName ?? '',
        fields.key ?? ''
      )

      await onComplete({
        data_points: {
          value: response.value,
          key: fields.key ?? '',
          environment: fields.environment ?? '',
          mapName: fields.mapName ?? '',
          organizationId: settings.apigeeOrgId,
        },
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: `Failed to get key-value map entry: ${errorMessage}` },
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
