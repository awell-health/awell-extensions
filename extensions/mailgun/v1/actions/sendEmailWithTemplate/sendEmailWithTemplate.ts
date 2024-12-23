import { type Action } from '@awell-health/extensions-core'
import { fields } from './config'
import { Category } from '@awell-health/extensions-core'
import { validateSettings, type settings } from '../../../settings'
import mailgunSdk from '../../../common/sdk/mailgunSdk'
import { getApiUrl } from '../../../common/utils'
import { validateActionFields } from './config/fields'
import { fromZodError } from 'zod-validation-error'
import { ZodError } from 'zod'
import { addActivityEventLog } from '../../../../../src/lib/awell/addEventLog'

export const sendEmailWithTemplate: Action<typeof fields, typeof settings> = {
  key: 'sendEmailWithTemplate',
  title: 'Send email with template',
  description: 'Send an email based on a template.',
  category: Category.COMMUNICATION,
  fields,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const { to, subject, template, variables } = validateActionFields(
        payload.fields
      )
      const { apiKey, domain, region, fromName, fromEmail, testMode } =
        validateSettings(payload.settings)

      const mg = mailgunSdk.client({
        username: 'api',
        key: apiKey,
        url: getApiUrl({ region }),
      })

      const res = await mg.messages.create(domain, {
        from: `${fromName} <${fromEmail}>`,
        to,
        subject,
        template,
        'h:X-Mailgun-Variables': JSON.stringify(variables),
        'o:testmode': testMode,
      })

      await onComplete({
        events: [
          addActivityEventLog({
            message: `Mailgun accepted the request, request ID: ${String(
              res?.id
            )}`,
          }),
        ],
      })
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
                message: error.message,
              },
            },
          ],
        })
        return
      }

      const error = err as Error
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: 'Something went wrong while orchestration the action' },
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
