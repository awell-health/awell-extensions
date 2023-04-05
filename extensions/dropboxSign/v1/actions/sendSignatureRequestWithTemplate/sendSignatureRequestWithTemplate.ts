import { type Action } from '../../../../../lib/types'
import { fields, dataPoints } from './config'
import { Category } from '../../../../../lib/types/marketplace'
import { type settings } from '../../../settings'
import { isEmpty, isNil } from 'lodash'
import DropboxSignSdk from '../../../common/sdk/dropboxSignSdk'
import { isInTestMode } from '../../../common/utils'
import { HttpError } from '@dropbox/sign'

export const sendSignatureRequestWithTemplate: Action<
  typeof fields,
  typeof settings
> = {
  key: 'sendSignatureRequestWithTemplate',
  title: 'Send signature request with template',
  description: 'Send a signature request based off a template.',
  category: Category.DOCUMENT_MANAGEMENT,
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError) => {
    const {
      patient: { id: patientId },
      activity: { id: activityId },
      fields: {
        signerRole,
        signerName,
        signerEmailAddress,
        templateId,
        title,
        subject,
        message,
        signingRedirectUrl,
      },
      settings: { apiKey, testMode },
    } = payload

    try {
      const allRequiredFieldsHaveValues = [
        signerRole,
        signerName,
        signerEmailAddress,
        templateId,
      ].every((field) => !isEmpty(field))

      if (!allRequiredFieldsHaveValues) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'Fields are missing' },
              error: {
                category: 'MISSING_FIELDS',
                message:
                  '`signerRole`, `signerName`, `signerEmailAddress`, or `templateId` is missing',
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

      const signer: DropboxSignSdk.SubSignatureRequestTemplateSigner = {
        role: String(signerRole),
        emailAddress: String(signerEmailAddress),
        name: String(signerName),
      }

      const defaultSigningOptions: DropboxSignSdk.SubSigningOptions = {
        draw: true,
        type: true,
        upload: true,
        phone: false,
        defaultType: DropboxSignSdk.SubSigningOptions.DefaultTypeEnum.Draw,
      }

      const data: DropboxSignSdk.SignatureRequestSendWithTemplateRequest = {
        templateIds: [String(templateId)],
        subject,
        message,
        signers: [signer],
        title,
        signingRedirectUrl,
        signingOptions: defaultSigningOptions,
        testMode: isInTestMode(String(testMode)),
        metadata: {
          awellPatientId: patientId,
          awellActivityId: activityId,
        },
      }

      const result = await signatureRequestApi.signatureRequestSendWithTemplate(
        data
      )

      await onComplete({
        data_points: {
          signatureRequestId: String(
            result.body.signatureRequest?.signatureRequestId
          ),
        },
      })
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
