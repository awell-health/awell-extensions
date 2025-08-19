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
    description: 'Apigee environment name to get metrics for',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

const dataPoints = {
  oneHourStats: {
    key: 'oneHourStats',
    valueType: 'json',
  },
  twentyFourHourStats: {
    key: 'twentyFourHourStats',
    valueType: 'json',
  },
  environment: {
    key: 'environment',
    valueType: 'string',
  },
  organizationId: {
    key: 'organizationId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const opsSnapshot: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'opsSnapshot',
  category: Category.EHR_INTEGRATIONS,
  title: 'Operations Snapshot',
  description: 'Provides aggregate operational metrics (total, error rate, p95) for 1-hour and 24-hour windows.',
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
      const response = await client.opsSnapshot(settings.apigeeOrgId, fields.environment ?? '')

      await onComplete({
        data_points: {
          oneHourStats: JSON.stringify(response.oneHour),
          twentyFourHourStats: JSON.stringify(response.twentyFourHour),
          environment: fields.environment ?? '',
          organizationId: settings.apigeeOrgId,
        },
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: `Failed to get operations snapshot: ${errorMessage}` },
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
