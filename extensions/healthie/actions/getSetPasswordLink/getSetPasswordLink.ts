import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { validatePayloadAndCreateSdk } from '../../lib/sdk/validatePayloadAndCreateSdk'

export const getSetPasswordLink: Action<typeof fields, typeof settings> = {
  key: 'getSetPasswordLink',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get set password link',
  description: 'Get the set password link for a patient',
  fields,
  previewable: false,
  dataPoints,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    const { fields, healthieSdk } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    const res = await healthieSdk.client.query({
      user: {
        __args: {
          id: fields.healthiePatientId,
        },
        set_password_link: true,
      },
    })

    await onComplete({
      data_points: {
        setPasswordLink:
          res.user?.set_password_link === undefined ||
          res.user?.set_password_link === null
            ? undefined
            : String(res.user.set_password_link),
      },
    })
  },
}
