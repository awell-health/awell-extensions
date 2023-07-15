import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import {
  SendgridClient,
  mapSendgridErrorsToActivityErrors,
} from '../../../client'
import { type settings, SettingsValidationSchema } from '../../../settings'
import { isEmpty, isNil } from 'lodash'
import { FieldsValidationSchema, fields } from './config'
import { z, ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { ResponseError } from '@sendgrid/helpers/classes'

export const addSuppressions: Action<typeof fields, typeof settings> = {
  key: 'addSuppressions',
  category: Category.SCHEDULING,
  title: 'Add Email to Suppression Lists',
  description: 'Adds an email to one or more suppression lists.',
  fields,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError): Promise<void> => {
    try {
      const {
        fields: { email, groups = [] },
        settings: { apiKey },
      } = validate({
        schema: z.object({
          fields: FieldsValidationSchema,
          settings: SettingsValidationSchema,
        }),
        payload,
      })

      const sendgridClient = new SendgridClient({ apiKey })
      if (!isNil(email) && !isEmpty(email)) {
        const tasks = groups?.map(async (g) => {
          return await sendgridClient.groups.suppressions.add(g, email)
        })
        await Promise.all(tasks)
        await onComplete()
      } else {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: {
                en: 'There was in error attempting to unenroll user from Sendgrid',
              },
              error: {
                category: 'SERVER_ERROR',
                message: 'Email cannot be blank',
              },
            },
          ],
        })
      }
    } catch (err) {
      if (err instanceof ZodError) {
        const error = fromZodError(err)
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: error.name },
              error: {
                category: 'WRONG_INPUT',
                message: `${error.message}`,
              },
            },
          ],
        })
        return
      } else if (err instanceof ResponseError) {
        const events = mapSendgridErrorsToActivityErrors(err)
        await onError({ events })
        return
      }
      const error = err as Error
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: 'There was an error in processing the suppression' },
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
