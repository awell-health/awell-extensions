import {
  type Field,
  FieldType,
  type Action,
  type DataPointDefinition,
  type OnErrorCallback,
  Category,
} from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { WellinksFlourishClient } from '../../wellinksFlourishClient'
import { isNil } from 'lodash'

const fields = {
  identifier: {
    id: 'identifier',
    label: 'Identifier',
    description: 'The identifier of the user to check Flourish for.',
    type: FieldType.STRING,
    required: true,
  },
} satisfies Record<string, Field>

const dataPoints = {
  userExists: {
    key: 'userExists',
    valueType: 'boolean',
  },
} satisfies Record<string, DataPointDefinition>

export const checkFlourishCustomer: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'checkFlourishCustomer',
  category: Category.WORKFLOW,
  title: 'Check for Flourish Customer',
  description: 'Checks Flourish for a customer with the given identifier.',
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, settings } = payload
    const { identifier } = fields
    try {
      if (
        isNil(settings.flourishApiUrl) ||
        isNil(settings.flourishApiKey) ||
        isNil(settings.flourishClientExtId)
      ) {
        throw new Error(
          'The Flourish API URL and/or API Key is not set in the settings'
        )
      }
      const client = new WellinksFlourishClient(
        settings.flourishApiUrl,
        settings.flourishApiKey,
        settings.flourishClientExtId
      )

      if (isNil(identifier)) {
        await buildValidationError('identifier', onError)
        return
      }

      const result = await client.user.exists(identifier)
      await onComplete({
        data_points: {
          userExists: result.toString(),
        },
      })
    } catch {
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: {
              en: 'an error occurred while checking for a Flourish customer',
            },
            error: {
              category: 'SERVER_ERROR',
              message:
                'an error occurred while checking for a Flourish customer',
            },
          },
        ],
      })
    }
  },
}

async function buildValidationError(
  field: string,
  onError: OnErrorCallback
): Promise<void> {
  await onError({
    events: [
      {
        date: new Date().toISOString(),
        text: {
          en: `The ${field} field is required`,
        },
        error: {
          category: 'SERVER_ERROR',
          message: `The ${field} field is required`,
        },
      },
    ],
  })
}
