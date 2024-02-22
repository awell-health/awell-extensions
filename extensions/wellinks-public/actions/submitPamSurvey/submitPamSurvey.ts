import {
  type Action,
  type DataPointDefinition,
  Category,
  validate,
} from '@awell-health/extensions-core'
import { type settings } from '../../config/settings'
import { WellinksFlourishClient } from '../../api/clients/wellinksFlourishClient'
import { z } from 'zod'
import {
  FieldsValidationSchema,
  SettingsValidationSchema,
  fields,
} from './config'

const dataPoints = {
  pamLevel: {
    key: 'pamLevel',
    valueType: 'number',
  },
  pamScore: {
    key: 'pamScore',
    valueType: 'number',
  },
  success: {
    key: 'success',
    valueType: 'boolean',
  },
} satisfies Record<string, DataPointDefinition>

export const submitPamSurvey: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'submitPamSurvey',
  category: Category.WORKFLOW,
  title: 'Submit PAM Survey',
  description: 'Submits a PAM survey to Flourish.',
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const {
      fields: {
        language,
        adminDate,
        thirdPartyIdentifier,
        gender,
        age,
        pa1,
        pa2,
        pa3,
        pa4,
        pa5,
        pa6,
        pa7,
        pa8,
        pa9,
        pa10,
        pa11,
        pa12,
        pa13,
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
      const result = await client.survey.submit(
        language,
        adminDate,
        thirdPartyIdentifier,
        gender,
        age,
        pa1,
        pa2,
        pa3,
        pa4,
        pa5,
        pa6,
        pa7,
        pa8,
        pa9,
        pa10,
        pa11,
        pa12,
        pa13
      )
      await onComplete({
        data_points: {
          pamLevel: result.pamLevel.toString(),
          pamScore: result.pamScore.toString(),
          success: result.success.toString(),
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
