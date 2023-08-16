import { type Action } from '@awell-health/extensions-core'
import { fields, dataPoints } from './config'
import { Category } from '@awell-health/extensions-core'
import { validateSettings, type settings } from '../../../settings'
import DropboxSignSdk from '../../../common/sdk/dropboxSignSdk'
import { HttpError } from '@dropbox/sign'
import { validateActionFields } from './config/fields'

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
    try {
      const {
        patient: { id: patientId },
        activity: { id: activityId },
      } = payload

      const {
        signerRole,
        signerName,
        signerEmailAddress,
        templateId,
        title,
        subject,
        message,
        signingRedirectUrl,
      } = validateActionFields(payload.fields)
      const { apiKey, testMode } = validateSettings(payload.settings)

      const signatureRequestApi = new DropboxSignSdk.SignatureRequestApi()
      signatureRequestApi.username = apiKey

      const signer: DropboxSignSdk.SubSignatureRequestTemplateSigner = {
        role: signerRole,
        emailAddress: signerEmailAddress,
        name: signerName,
      }

      const defaultSigningOptions: DropboxSignSdk.SubSigningOptions = {
        draw: true,
        type: true,
        upload: true,
        phone: false,
        defaultType: DropboxSignSdk.SubSigningOptions.DefaultTypeEnum.Draw,
      }

      const data: DropboxSignSdk.SignatureRequestSendWithTemplateRequest = {
        templateIds: [templateId],
        subject,
        message,
        signers: [signer],
        title,
        signingRedirectUrl,
        signingOptions: defaultSigningOptions,
        testMode,
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

      /**
       * re-throw to be handled inside awell-extension-server
       */
      throw err
    }
  },
}
