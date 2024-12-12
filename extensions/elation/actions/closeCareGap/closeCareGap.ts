import { Category, type Action } from '@awell-health/extensions-core'
import { makeAPIClient } from '../../client'
import { type settings } from '../../settings'
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
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {    
    const { quality_program, caregap_id } = FieldsValidationSchema.parse(payload.fields)

    // The care gap API uses a different base URL than the rest of the Elation API, see https://docs.elationhealth.com/reference/caregaps_post_caregaps_api__quality_program__caregap__post-1
    const baseUrl = payload.settings.base_url ?? ''
    const caregapBaseUrl = baseUrl
      .replace(/(.+\.)?elationemr\.com\/api\/2\.0\/?/, 'caregaps.$1elationemr.com/caregaps/api/')

    const api = makeAPIClient({
      ...payload.settings,
      baseUrl: caregapBaseUrl,
    })

    await api.closeCareGap({
      quality_program,
      caregap_id,
      status: 'closed',
    })

    await onComplete()
  },
}
