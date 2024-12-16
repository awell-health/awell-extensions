import { Category, validate, type Action } from '@awell-health/extensions-core'
import { z } from 'zod'
import { makeAPIClient } from '../../client'
import { SettingsValidationSchema, type settings } from '../../settings'
import { dataPoints, fields, FieldsValidationSchema } from './config'

export const createCareGap: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'createCareGap',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create care gap',
  description: 'Create a care gap in Elation.',
  fields,
  previewable: false,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const {
      fields: {
        patient_id,
        practice_id,
        created_date,
        status,
        detail,
        quality_program,
        definition_id,
      },
      settings,
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
        settings: SettingsValidationSchema,
      }),
      payload,
    })

    // The care gap API uses a different base URL than the rest of the Elation API, see https://docs.elationhealth.com/reference/caregaps_post_caregaps_api__quality_program__caregap__post-1
    const caregapBaseUrl = settings.base_url.replace(
      /(.+\.)?elationemr\.com\/api\/2\.0\/?/,
      'caregaps.$1elationemr.com/caregaps/api/'
    )

    const api = makeAPIClient({
      ...payload.settings,
      baseUrl: caregapBaseUrl,
    })

    const careGap = await api.createCareGap({
      quality_program,
      definition_id,
      patient_id,
      practice_id,
      created_date,
      status,
      detail: detail ?? '',
    })

    await onComplete({
      data_points: {
        id: careGap.id,
      },
    })
  },
}
