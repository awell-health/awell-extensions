import { type Action } from '@/types'
import { fields, dataPoints } from './config'
import { Category } from '@/types/marketplace'
import { type settings } from '@/extensions/dropboxSign/settings'
import { isNil } from 'lodash'
import DropboxSignSdk from '@/extensions/dropboxSign/common/sdk/dropboxSignSdk'

export const getSignatureRequest: Action<typeof fields, typeof settings> = {
  key: 'getSignatureRequest',
  title: 'Cancel signature request',
  description:
    'Returns the SignatureRequest specified by the signature request id.',
  category: Category.DOCUMENT_MANAGEMENT,
  fields,
  dataPoints,
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
          signatureRequestApi.signatureRequestGet(signatureRequestId)

        result
          .then(async (response) => {
            const signatures = response.body.signatureRequest?.signatures ?? []
            const hasSignature = signatures.length >= 1

            await onComplete({
              data_points: {
                title: response.body.signatureRequest?.title,
                originalTitle: response.body.signatureRequest?.originalTitle,
                subject: response.body.signatureRequest?.subject,
                message: response.body.signatureRequest?.message,
                signingUrl: response.body.signatureRequest?.signingUrl,
                signingRedirectUrl:
                  response.body.signatureRequest?.signingRedirectUrl,
                detailsUrl: response.body.signatureRequest?.detailsUrl,
                requesterEmailAddress:
                  response.body.signatureRequest?.requesterEmailAddress,
                signerEmailAddress: hasSignature
                  ? signatures[0].signerEmailAddress
                  : undefined,
                signerName: hasSignature ? signatures[0].signerName : undefined,
                signerRole: hasSignature ? signatures[0].signerRole : undefined,
                statusCode: hasSignature ? signatures[0].statusCode : undefined,
              },
            })
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
