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

export const createCoverage: Action<typeof fields, typeof settings> = {
  key: 'createCoverage',
  category: Category.EHR_INTEGRATIONS,
  title: 'Create coverage',
  description: 'Create a coverage',
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        fields: {
          order,
          status,
          type,
          subscriberId,
          subscriber: subscriberValue,
          beneficiary: beneficiaryValue,
          relationship,
          periodStart,
          periodEnd,
          payor,
          classCoverage,
        },
      } = validate({
        schema: z.object({
          fields: fieldsValidationSchema,
        }),
        payload,
      })

      const api = makeAPIClient(payload.settings)
      const coverageId = await api.createCoverage({
        resourceType: 'Coverage',
        order,
        status,
        type,
        subscriber: {
          reference: subscriberValue,
        },
        subscriberId,
        beneficiary: {
          reference: beneficiaryValue,
        },
        relationship,
        period: {
          start: periodStart,
          end: periodEnd,
        },
        payor,
        class: classCoverage,
      })

      await onComplete({
        data_points: {
          coverageId,
        },
      })
    } catch (error) {
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
