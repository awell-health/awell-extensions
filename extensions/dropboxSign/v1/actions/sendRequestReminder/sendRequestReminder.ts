import { type Action } from '@awell-health/extensions-core'
import { fields } from './config'
import { Category } from '@awell-health/extensions-core'
import { validateSettings, type settings } from '../../../settings'
import DropboxSignSdk from '../../../common/sdk/dropboxSignSdk'
import { HttpError } from '@dropbox/sign'
import { validateActionFields } from './config/fields'

export const sendRequestReminder: Action<typeof fields, typeof settings> = {
  key: 'sendRequestReminder',
  title: 'Send request reminder',
  description:
    'Sends an email to the signer reminding them to sign the signature request.',
  category: Category.DOCUMENT_MANAGEMENT,
  fields,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const { signatureRequestId, signerEmailAddress } = validateActionFields(
        payload.fields
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
                  sdkErrorMessage
                )}`,
              },
            },
          ],
        })
        return
      }

      // re-throw to be handled inside awell-extension-server
      throw err
    }
  },
}
