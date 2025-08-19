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
  email: {
    id: 'email',
    label: 'Developer Email',
    description: 'Email address of the developer',
    type: FieldType.STRING,
    required: true,
  },
  firstName: {
    id: 'firstName',
    label: 'First Name',
    description: 'First name of the developer',
    type: FieldType.STRING,
    required: true,
  },
  lastName: {
    id: 'lastName',
    label: 'Last Name',
    description: 'Last name of the developer',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

const dataPoints = {
  developerId: {
    key: 'developerId',
    valueType: 'string',
  },
  email: {
    key: 'email',
    valueType: 'string',
  },
  status: {
    key: 'status',
    valueType: 'string',
  },
  created: {
    key: 'created',
    valueType: 'boolean',
  },
  organizationId: {
    key: 'organizationId',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

export const ensureDeveloper: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'ensureDeveloper',
  category: Category.EHR_INTEGRATIONS,
  title: 'Ensure Developer Exists',
  description: 'Creates a developer if they do not exist, or returns existing developer information. Idempotent operation.',
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
      const response = await client.ensureDeveloper(
        settings.apigeeOrgId,
        fields.email ?? '',
        fields.firstName ?? '',
        fields.lastName ?? ''
      )

      await onComplete({
        data_points: {
          developerId: response.developerId,
          email: response.email,
          status: response.status,
          created: String(response.created),
          organizationId: settings.apigeeOrgId,
        },
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: `Failed to ensure developer: ${errorMessage}` },
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
