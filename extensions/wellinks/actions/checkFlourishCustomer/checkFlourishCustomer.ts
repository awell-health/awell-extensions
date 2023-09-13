import {
  type Action,
  type DataPointDefinition,
  type OnErrorCallback,
  Category,
  validate,
} from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { WellinksFlourishClient } from '../../wellinksFlourishClient'
import { fromZodError, type ValidationError } from 'zod-validation-error'
import {
  FieldsValidationSchema,
  SettingsValidationSchema,
  fields,
} from './config'
import { z, ZodError } from 'zod'

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
    try {
      const {
        fields: { identifier },
        settings: { flourishApiKey, flourishApiUrl, flourishClientExtId },
      } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
          settings: SettingsValidationSchema,
        }),
        payload,
      })

      const client = new WellinksFlourishClient(
        flourishApiUrl,
        flourishApiKey,
        flourishClientExtId
      )

      const result = await client.user.exists(identifier)
      await onComplete({
        data_points: {
          userExists: result.toString(),
        },
      })
    } catch (err) {
      if (err instanceof ZodError) {
        const error = fromZodError(err)
        await buildValidationError(error, onError)
      } else {
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
    }
  },
}

async function buildValidationError(
  zodError: ValidationError,
  onError: OnErrorCallback
): Promise<void> {
  await onError({
    events: [
      {
        date: new Date().toISOString(),
        text: {
          en: zodError.name,
        },
        error: {
          category: 'SERVER_ERROR',
          message: `${zodError.message}`,
        },
      },
    ],
  })
}
