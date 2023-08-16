import { type Action } from '@awell-health/extensions-core'
import { fields } from './config'
import { Category } from '@awell-health/extensions-core'
import { validateSettings, type settings } from '../../../settings'
import DropboxSignSdk from '../../../common/sdk/dropboxSignSdk'
import { HttpError } from '@dropbox/sign'
import { validateActionFields } from './config/fields'

export const cancelSignatureRequest: Action<typeof fields, typeof settings> = {
  key: 'cancelSignatureRequest',
  title: 'Cancel signature request',
  description:
    'Cancels an incomplete signature request. This action is not reversible.',
  category: Category.DOCUMENT_MANAGEMENT,
  fields,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const { signatureRequestId } = validateActionFields(payload.fields)
      const { apiKey } = validateSettings(payload.settings)

      const signatureRequestApi = new DropboxSignSdk.SignatureRequestApi()
      signatureRequestApi.username = apiKey

      await signatureRequestApi.signatureRequestCancel(signatureRequestId)

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

      /**
       * re-throw to be handled inside awell-extension-server
       */
      throw err
    }
  },
}
