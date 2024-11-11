import { z } from 'zod'
import { AxiosError } from 'axios'
import { isNil } from 'lodash'

import { type Action, Category, validate } from '@awell-health/extensions-core'
import { SettingsValidationSchema, type settings } from '../../settings'
import { makeAPIClient } from '../../client'
import { FieldsValidationSchema, fields as elationFields } from './config'
import { type HistoryTypeSchema } from '../../types/history'

export const addHistories: Action<typeof elationFields, typeof settings> = {
  key: 'addHistories',
  category: Category.EHR_INTEGRATIONS,
  title: 'Add Histories',
  description: "Add history items on Elation's patient page",
  fields: elationFields,
  previewable: true,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    try {
      const { fields, settings } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
          settings: SettingsValidationSchema,
        }),
        payload,
      })
      // we can execute up to 12 time so we want to capture if any of the fields failed
      const failedFields: string[] = []

      const api = makeAPIClient(settings)

      // Get all field names except 'patientId'
      const fieldNames = Object.keys(fields).filter(
        (field) => field !== 'patientId'
      )

      // Attempt to add histories for each field
      await Promise.all(
        fieldNames.map(async (field) => {
          const key = field as keyof typeof elationFields
          const type = elationFields[key]?.label as z.infer<
            typeof HistoryTypeSchema
          >

          try {
            await api.addHistory({
              type,
              patient: fields.patientId,
              text: field,
            })
          } catch (failedField) {
            const errMessage =
              failedField instanceof Error
                ? failedField.message
                : 'failed to add'
            failedFields.push(`${type}: ${errMessage}`)
          }
        })
      )

      if (failedFields.length > 0) {
        throw new Error(
          `Failed to create histories for fields: ${failedFields.join(', ')}`
        )
      }
      await onComplete()
    } catch (err) {
      if (err instanceof AxiosError) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: {
                en: `${err.status ?? '(no status code)'} Error: ${err.message}`,
              },
              error: {
                category: 'SERVER_ERROR',
                message: `${err.status ?? '(no status code)'} Error: ${
                  err.message
                }`,
              },
            },
          ],
        })
      } else {
        // Handles Zod and other unknown errors
        throw err
      }
    }
  },
}
