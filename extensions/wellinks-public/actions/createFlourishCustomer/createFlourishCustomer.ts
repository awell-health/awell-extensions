import {
  type Action,
  type DataPointDefinition,
  Category,
  validate,
} from '@awell-health/extensions-core'
import { type settings } from '../../config/settings'
import { WellinksFlourishClient } from '../../api/clients/wellinksFlourishClient'
import {
  FieldsValidationSchema,
  SettingsValidationSchema,
  fields,
} from './config'
import { z } from 'zod'

const dataPoints = {
  createSuccessful: {
    key: 'createSuccessful',
    valueType: 'boolean',
  },
} satisfies Record<string, DataPointDefinition>

export const createFlourishCustomer: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createFlourishCustomer',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create a Flourish Customer',
  description: 'Creates a customer in Flourish using supplied information.',
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const {
      fields: {
        firstName,
        lastName,
        dateOfBirth,
        subgroupId,
        thirdPartyIdentifier,
      },
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
    try {
      const result = await client.user.create(
        firstName,
        lastName,
        dateOfBirth,
        subgroupId,
        thirdPartyIdentifier
      )
      await onComplete({
        data_points: {
          createSuccessful: result.toString(),
        },
      })
    } catch (err) {
      const error = err as Error
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: 'Something went wrong while orchestration the action' },
            error: {
              category: 'SERVER_ERROR',
              message: error.message,
            },
          },
        ],
      })
    }
  },
}
