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
  },
}
