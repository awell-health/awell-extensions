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
  appId: {
    id: 'appId',
    label: 'Application ID',
    description: 'ID of the developer application',
    type: FieldType.STRING,
    required: true,
  },
  keyId: {
    id: 'keyId',
    label: 'Key ID (Optional)',
    description: 'Specific key to revoke. If not provided, the entire app will be suspended.',
    type: FieldType.STRING,
    required: false,
  },
} satisfies Record<string, Field>

const dataPoints = {
  action: {
    key: 'action',
    valueType: 'string',
  },
  timestamp: {
    key: 'timestamp',
    valueType: 'string',
  },
  organizationId: {
    key: 'organizationId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const revokeKeyOrSuspendApp: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'revokeKeyOrSuspendApp',
  category: Category.EHR_INTEGRATIONS,
  title: 'Revoke Key or Suspend App',
  description: 'Emergency kill switch to revoke a specific API key or suspend an entire developer application.',
  fields,
  previewable: false,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const { settings, fields } = payload
      
      if (settings.apigeeOrgId == null || settings.apigeeOrgId.trim() === '') {
        throw new Error('Apigee Organization ID is required')
      }
      
      const client = new ApigeeApiClient()
      const response = await client.revokeKeyOrSuspendApp(
        settings.apigeeOrgId,
        fields.developerId ?? '',
        fields.appId ?? '',
        fields.keyId
      )

      await onComplete({
        data_points: {
          action: response.action,
          timestamp: response.timestamp,
          organizationId: settings.apigeeOrgId,
        },
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: `Failed to revoke key or suspend app: ${errorMessage}` },
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
