import { type Action } from '../../../../../lib/types/'
import { fields } from './config'
import { Category } from '../../../../../lib/types/marketplace'
import { type settings } from '../../../settings'
import { isNil } from 'lodash'
import DropboxSignSdk from '../../../common/sdk/dropboxSignSdk'
import { HttpError } from '@dropbox/sign'

export const cancelSignatureRequest: Action<typeof fields, typeof settings> = {
  key: 'cancelSignatureRequest',
  title: 'Cancel signature request',
  description:
    'Cancels an incomplete signature request. This action is not reversible.',
  category: Category.DOCUMENT_MANAGEMENT,
  fields,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError) => {
    const {
      fields: { signatureRequestId },
      settings: { apiKey },
    } = payload

    try {
      if (isNil(signatureRequestId)) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'Fields are missing' },
              error: {
                category: 'MISSING_FIELDS',
                message: '`signatureRequestId` field is missing',
              },
            },
          ],
        })
        return
      }

      if (isNil(apiKey)) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'Missing an API key' },
              error: {
                category: 'MISSING_SETTINGS',
                message: 'Missing an API key',
              },
            },
          ],
        })
        return
      }

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
