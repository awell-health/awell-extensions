import { type Action } from '@/types'
import { fields } from './config'
import { Category } from '@/types/marketplace'
import { type settings } from '@/extensions/dropboxSign/settings'
import { isNil } from 'lodash'
import DropboxSignSdk from '@/extensions/dropboxSign/common/sdk/dropboxSignSdk'

export const cancelSignatureRequest: Action<typeof fields, typeof settings> = {
  key: 'cancelSignatureRequest',
  title: 'Cancel signature request',
  description:
    'Cancels an incomplete signature request. This action is not reversible.',
  category: Category.DOCUMENT_MANAGEMENT,
  fields,
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

      if (signatureRequestApi !== undefined) {
        const result =
          signatureRequestApi.signatureRequestCancel(signatureRequestId)

        console.log(result)

        result
          .then(async (response) => {
            await onComplete()
          })
          .catch(async (error) => {
            await onError({
              events: [
                {
                  date: new Date().toISOString(),
                  text: { en: 'Exception when calling Dropbox Sign API' },
                  error: {
                    category: 'SERVER_ERROR',
                    message: error.message,
                  },
                },
              ],
            })
          })
      } else {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'Failed to initialize Dropbox Sign SDK.' },
              error: {
                category: 'SDK_ERROR',
                message: 'Failed to initialize Dropbox Sign SDK.',
              },
            },
          ],
        })
      }
    } catch (err) {
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
