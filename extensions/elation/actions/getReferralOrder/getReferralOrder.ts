import { type Action, Category } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { makeAPIClient } from '../../client'
import { FieldsValidationSchema, fields, dataPoints } from './config'

export const getReferralOrder: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getReferralOrder',
  category: Category.EHR_INTEGRATIONS,
  title: 'Get referral order',
  description: 'Retrieve a referral order from Elation.',
  fields,
  previewable: true,
  supports_automated_retries: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log({ meta, fields: payload.fields }, 'Processing getReferralOrder')

    try {
      const { referralOrderId } = FieldsValidationSchema.parse(payload.fields)
      const api = makeAPIClient(payload.settings)

      const res = await api.getReferralOrder(referralOrderId)

      await onComplete({
        data_points: {
          letterId: String(res.letter),
          patientId: String(res.patient),
          consultantName: res.consultant_name,
          practice: String(res.practice),
          diagnosisCodes: JSON.stringify(
            res.icd10_codes?.map((code) => code.code),
          ),
          diagnosisLabels: JSON.stringify(
            res.icd10_codes?.map((code) => code.description),
          ),
        },
      })
    } catch (err) {
      helpers.log({ meta, err }, 'error', err as Error)
      const error = err as Error
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: error.message },
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
