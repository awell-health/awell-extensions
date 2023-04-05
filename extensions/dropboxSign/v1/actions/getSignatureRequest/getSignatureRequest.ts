import { type Action } from '../../../../../lib/types'
import { fields, dataPoints } from './config'
import { Category } from '../../../../../lib/types/marketplace'
import { type settings } from '../../../settings'
import { isNil } from 'lodash'
import DropboxSignSdk from '../../../common/sdk/dropboxSignSdk'

export const getSignatureRequest: Action<typeof fields, typeof settings> = {
  key: 'getSignatureRequest',
  title: 'Get signature request',
  description:
    'Returns the SignatureRequest specified by the signature request id.',
  category: Category.DOCUMENT_MANAGEMENT,
  fields,
  dataPoints,
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

      const result = await signatureRequestApi.signatureRequestGet(
        signatureRequestId
      )

      const signatures = result.body.signatureRequest?.signatures ?? []
      const hasSignature = signatures.length >= 1

      await onComplete({
        data_points: {
          title: result.body.signatureRequest?.title,
          originalTitle: result.body.signatureRequest?.originalTitle,
          subject: result.body.signatureRequest?.subject,
          message: result.body.signatureRequest?.message,
          signingUrl: result.body.signatureRequest?.signingUrl,
          signingRedirectUrl: result.body.signatureRequest?.signingRedirectUrl,
          detailsUrl: result.body.signatureRequest?.detailsUrl,
          requesterEmailAddress:
            result.body.signatureRequest?.requesterEmailAddress,
          signerEmailAddress: hasSignature
            ? signatures[0].signerEmailAddress
            : undefined,
          signerName: hasSignature ? signatures[0].signerName : undefined,
          signerRole: hasSignature ? signatures[0].signerRole : undefined,
          statusCode: hasSignature ? signatures[0].statusCode : undefined,
        },
      })
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
