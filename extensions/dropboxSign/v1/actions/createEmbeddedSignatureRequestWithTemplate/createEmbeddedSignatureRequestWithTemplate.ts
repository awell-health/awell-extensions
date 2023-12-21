import { type Action } from '@awell-health/extensions-core'
import {
  fields,
  dataPoints,
  validateActionFields,
  validateEmbeddedSignatureRequestResponse,
  validateGetSignUrlResponse,
} from './config'
import { Category } from '@awell-health/extensions-core'
import { validateSettings, type settings } from '../../../settings'
import DropboxSignSdk from '../../../common/sdk/dropboxSignSdk'
import { fromZodError } from 'zod-validation-error'
import { ZodError } from 'zod'
import { HttpError } from '@dropbox/sign'

export const createEmbeddedSignatureRequestWithTemplate: Action<
  typeof fields,
  typeof settings
> = {
  key: 'createEmbeddedSignatureRequestWithTemplate',
  title: 'Create embedded signature request with template',
  description:
    'Let a stakeholder sign a request within Awell based off a template. The care flow will not progress until the request is signed.',
  category: Category.DOCUMENT_MANAGEMENT,
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError) => {
    try {
      const {
        patient: { id: patientId },
        activity: { id: activityId },
        pathway: { id: pathwayId, definition_id: pathwayDefinitionId },
      } = payload

      const {
        signerRole,
        signerName,
        signerEmailAddress,
        templateId,
        title,
        subject,
        message,
        customFields,
      } = validateActionFields(payload.fields)
      const { apiKey, clientId, testMode } = validateSettings(payload.settings)

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

      const data: DropboxSignSdk.SignatureRequestCreateEmbeddedWithTemplateRequest =
        {
          clientId,
          templateIds: [String(templateId)],
          subject,
          message,
          signers: [signer],
          title,
          signingOptions: defaultSigningOptions,
          testMode,
          metadata: {
            awellPathwayDefinitionId: pathwayDefinitionId,
            awellPatientId: patientId,
            awellPathwayId: pathwayId,
            awellActivityId: activityId,
          },
          customFields,
        }

      const embeddedSignatureRequestResponse =
        await signatureRequestApi.signatureRequestCreateEmbeddedWithTemplate(
          data
        )

      const {
        body: {
          signatureRequest: { signatureRequestId, signatures },
        },
      } = validateEmbeddedSignatureRequestResponse(
        embeddedSignatureRequestResponse
      )

      const signatureId = signatures[0].signatureId

      const embeddedApi = new DropboxSignSdk.EmbeddedApi()
      embeddedApi.username = apiKey

      const getEmbeddedSignUrlResponse = await embeddedApi.embeddedSignUrl(
        signatureId
      )

      const {
        body: {
          embedded: { signUrl, expiresAt },
        },
      } = validateGetSignUrlResponse(getEmbeddedSignUrlResponse)

      await onComplete({
        data_points: {
          signatureRequestId,
          signUrl,
          expiresAt,
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
