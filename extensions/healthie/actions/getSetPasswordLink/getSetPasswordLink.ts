import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { validatePayloadAndCreateSdk } from '../../lib/sdk/validatePayloadAndCreateSdk'
import { isNil } from 'lodash'

export const getSetPasswordLink: Action<typeof fields, typeof settings> = {
  key: 'getSetPasswordLink',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get set password link',
  description: 'Get the set password link for a patient',
  fields,
  previewable: false,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const MAX_RETRIES = 3
    const BASE_DELAY_MS = process.env.NODE_ENV === 'test' ? 10 : 1000

    const { fields, healthieSdk } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    let setPasswordLink: string | undefined

    /**
     * We need to retry the API call because:
     * - The setPasswordLink field is not immediately available after creating a new user.
     * - The API response is inconsistent
     */
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const res = await healthieSdk.client.query({
        user: {
          __args: {
            id: fields.healthiePatientId,
          },
          set_password_link: true,
        },
      })

      if (!isNil(res.user?.set_password_link)) {
        setPasswordLink = String(res.user?.set_password_link)
        break
      }

      // Exponential backoff delay calculation
      const delay = BASE_DELAY_MS * Math.pow(2, attempt)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }

    await onComplete({
      data_points: {
        setPasswordLink:
          setPasswordLink === undefined || setPasswordLink === null
            ? undefined
            : String(setPasswordLink),
      },
    })
  },
}
