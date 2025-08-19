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
  overlapHours: {
    id: 'overlapHours',
    label: 'Overlap Hours',
    description: 'Number of hours both keys should remain valid (default: 24)',
    type: FieldType.NUMERIC,
    required: false,
  },
} satisfies Record<string, Field>

const dataPoints = {
  oldKeyId: {
    key: 'oldKeyId',
    valueType: 'string',
  },
  newKeyId: {
    key: 'newKeyId',
    valueType: 'string',
  },
  overlapEndsAt: {
    key: 'overlapEndsAt',
    valueType: 'string',
  },
  organizationId: {
    key: 'organizationId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const rotateKeyWithOverlap: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'rotateKeyWithOverlap',
  category: Category.EHR_INTEGRATIONS,
  title: 'Rotate API Key with Overlap',
  description: 'Issues a new API key while keeping the old key valid for a specified overlap period.',
  fields,
  previewable: false,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const { settings, fields } = payload
      
      if (settings.apigeeOrgId == null || settings.apigeeOrgId.trim() === '') {
        throw new Error('Apigee Organization ID is required')
      }
      
      const overlapHours = fields.overlapHours != null ? Number(fields.overlapHours) : 24
      
      const client = new ApigeeApiClient()
      const response = await client.rotateKeyWithOverlap(
        settings.apigeeOrgId,
        fields.developerId ?? '',
        fields.appId ?? '',
        overlapHours
      )

      await onComplete({
        data_points: {
          oldKeyId: response.oldKeyId,
          newKeyId: response.newKeyId,
          overlapEndsAt: response.overlapEndsAt,
          organizationId: settings.apigeeOrgId,
        },
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: `Failed to rotate API key: ${errorMessage}` },
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
