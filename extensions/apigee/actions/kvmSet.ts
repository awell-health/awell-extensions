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
    description: 'Key to set in the map',
    type: FieldType.STRING,
    required: true,
  },
  value: {
    id: 'value',
    label: 'Value',
    description: 'Value to store (will be redacted in logs)',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

const dataPoints = {
  success: {
    key: 'success',
    valueType: 'boolean',
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

export const kvmSet: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'kvmSet',
  category: Category.EHR_INTEGRATIONS,
  title: 'Set Key-Value Map Entry',
  description: 'Sets a value in an environment-scoped key-value map. Value is redacted in logs.',
  fields,
  previewable: false,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const { settings, fields } = payload
      
      if (settings.apigeeOrgId == null || settings.apigeeOrgId.trim() === '') {
        throw new Error('Apigee Organization ID is required')
      }
      
      console.log(`Setting KVM entry for key: ${fields.key ?? ''}, value: [REDACTED]`)
      
      const client = new ApigeeApiClient()
      const response = await client.kvmSet(
        settings.apigeeOrgId,
        fields.environment ?? '',
        fields.mapName ?? '',
        fields.key ?? '',
        fields.value ?? ''
      )

      await onComplete({
        data_points: {
          success: String(response.success),
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
            text: { en: `Failed to set key-value map entry: ${errorMessage}` },
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
