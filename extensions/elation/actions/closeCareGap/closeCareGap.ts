import { Category, validate, type Action } from '@awell-health/extensions-core'
import { z } from 'zod'
import { makeAPIClient } from '../../client'
import { SettingsValidationSchema, type settings } from '../../settings'
import { dataPoints, fields, FieldsValidationSchema } from './config'

export const closeCareGap: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'closeCareGap',
  category: Category.EHR_INTEGRATIONS,
  title: 'Close care gap',
  description: 'Close a care gap in Elation.',
  fields,
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    const {
      fields: { quality_program, caregap_id },
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
      'caregaps.$1elationemr.com/caregaps/api/',
    )

    const api = makeAPIClient({
      ...payload.settings,
      baseUrl: caregapBaseUrl,
    })

    const closeCareGapRequest = {
      quality_program,
      caregap_id,
      status: 'closed',
    }

    helpers.log({ meta, closeCareGapRequest }, 'Closing Elation care gap')

    await api.closeCareGap(closeCareGapRequest)

    await onComplete()
  },
}
