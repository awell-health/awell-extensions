import { type Action } from '@awell-health/extensions-core'
import { fields, dataPoints } from './config'
import { Category } from '@awell-health/extensions-core'
import { validateSettings, type settings } from '../../../settings'
import DropboxSignSdk from '../../../common/sdk/dropboxSignSdk'
import { HttpError } from '@dropbox/sign'
import { fromZodError } from 'zod-validation-error'
import { ZodError } from 'zod'
import { validateActionFields } from './config/fields'

export const getSignatureRequest: Action<typeof fields, typeof settings> = {
  key: 'getSignatureRequest',
  title: 'Get signature request',
  description: 'Get details about a signature request.',
  category: Category.DOCUMENT_MANAGEMENT,
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const { signatureRequestId } = validateActionFields(payload.fields)
      const { apiKey } = validateSettings(payload.settings)

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
