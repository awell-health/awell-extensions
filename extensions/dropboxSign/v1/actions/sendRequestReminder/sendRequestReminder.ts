import { type Action } from '@awell-health/extensions-core'
import { fields } from './config'
import { Category } from '@awell-health/extensions-core'
import { validateSettings, type settings } from '../../../settings'
import DropboxSignSdk from '../../../common/sdk/dropboxSignSdk'
import { HttpError } from '@dropbox/sign'
import { fromZodError } from 'zod-validation-error'
import { ZodError } from 'zod'
import { validateActionFields } from './config/fields'

export const sendRequestReminder: Action<typeof fields, typeof settings> = {
  key: 'sendRequestReminder',
  title: 'Send request reminder',
  description:
    'Sends an email to the signer reminding them to sign the signature request.',
  category: Category.DOCUMENT_MANAGEMENT,
  fields,
  previewable: true,
  onEvent: async ({ payload, onComplete, onError, helpers }) => {
    const meta = {
      tenant_id: payload.pathway.tenant_id,
      careflow_id: payload.pathway.id,
      activity_id: payload.activity.id,
    }

    helpers.log(
      { meta, fields: payload.fields },
      'Processing sendRequestReminder',
    )

    try {
      const { signatureRequestId, signerEmailAddress } = validateActionFields(
        payload.fields,
      )
      const { apiKey } = validateSettings(payload.settings)

      const signatureRequestApi = new DropboxSignSdk.SignatureRequestApi()
      signatureRequestApi.username = apiKey

      const data: DropboxSignSdk.SignatureRequestRemindRequest = {
        emailAddress: signerEmailAddress,
      }

      await signatureRequestApi.signatureRequestRemind(signatureRequestId, data)

      await onComplete()
    } catch (err) {
      helpers.log({ meta, err }, 'error', err as Error)
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
      }

      if (err instanceof HttpError) {
        const sdkErrorMessage = err.body?.error?.errorMsg

        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: {
                en: err.name,
              },
              error: {
                category: 'SERVER_ERROR',
                message: `${String(err?.statusCode)}: ${String(
                  sdkErrorMessage,
                )}`,
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
