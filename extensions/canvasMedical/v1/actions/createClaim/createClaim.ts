import { validate, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../../settings'
import { Category } from '@awell-health/extensions-core'
import { fields, dataPoints, fieldsValidationSchema } from './config'
import {
  isAxiosError,
  isZodError,
  parseAxiosError,
  parseUnknowError,
  parseZodError,
} from '../../utils'
import { z } from 'zod'
import { type AxiosError } from 'axios'
import { makeAPIClient } from '../../client'

export const createClaim: Action<typeof fields, typeof settings> = {
  key: 'createClaim',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create claim',
  description: 'Create a claim for a specific patient.',
  fields,
  dataPoints,
  previewable: true,
  onEvent: async ({ payload, onComplete, onError, helpers }) => {
    try {
      const {
        fields: {
          status,
          type,
          patientId,
          created,
          provider,
          supportingInfo,
          diagnosis,
          insurance,
          item,
        },
      } = validate({
        schema: z.object({
          fields: fieldsValidationSchema,
        }),
        payload,
      })

      const api = makeAPIClient(payload.settings)
      const claimId = await api.createClaim({
        resourceType: 'Claim',
        status,
        type,
        use: 'claim',
        patient: {
          reference: `Patient/${patientId}`,
        },
        created,
        provider,
        supportingInfo,
        diagnosis,
        insurance,
        item,
      })

      await onComplete({
        data_points: {
          claimId,
        },
      })
    } catch (error) {
      helpers.log({ error }, 'error', error as Error)
      let parsedError

      if (isZodError(error)) {
        parsedError = parseZodError(error)
      } else if (isAxiosError(error)) {
        parsedError = parseAxiosError(error as AxiosError)
      } else {
        parsedError = parseUnknowError(error as Error)
      }
      await onError({
        events: [parsedError],
      })
    }
  },
}
