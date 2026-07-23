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
import { type CoverageWithId } from '../../validation/coverage.zod'

export const updateCoverage: Action<typeof fields, typeof settings> = {
  key: 'updateCoverage',
  category: Category.EHR_INTEGRATIONS,
  title: 'Update coverage',
  description: 'Update a coverage',
  fields,
  dataPoints,
  previewable: true,
  onEvent: async ({ payload, onComplete, onError, helpers }) => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    try {
      const {
        fields: {
          id,
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
      const coverageData = {
        id,
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
      } satisfies CoverageWithId

      helpers.log(
        { meta, coverageData },
        '[updateCoverage] Updating Canvas coverage',
      )

      const coverageId = await api.updateCoverage(coverageData)

      await onComplete({
        data_points: {
          coverageId,
        },
      })
    } catch (error) {
      helpers.log({ meta, error }, 'error', error as Error)
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
