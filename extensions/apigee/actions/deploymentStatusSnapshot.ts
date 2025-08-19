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
  snapshots: {
    key: 'snapshots',
    valueType: 'json',
  },
  snapshotCount: {
    key: 'snapshotCount',
    valueType: 'number',
  },
  organizationId: {
    key: 'organizationId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const deploymentStatusSnapshot: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'deploymentStatusSnapshot',
  category: Category.EHR_INTEGRATIONS,
  title: 'Deployment Status Snapshot',
  description: 'Provides a snapshot of deployment status for all proxies across environments.',
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
      const response = await client.deploymentStatusSnapshot(settings.apigeeOrgId)

      await onComplete({
        data_points: {
          snapshots: JSON.stringify(response.snapshots),
          snapshotCount: String(response.snapshots.length),
          organizationId: settings.apigeeOrgId,
        },
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: `Failed to get deployment status snapshot: ${errorMessage}` },
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
