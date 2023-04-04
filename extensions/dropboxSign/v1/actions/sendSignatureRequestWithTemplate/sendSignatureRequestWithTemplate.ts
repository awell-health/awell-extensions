import { type Action } from '../../../../../lib/types'
import { fields, dataPoints } from './config'
import { Category } from '../../../../../lib/types/marketplace'
import { type settings } from '../../../settings'
import { isEmpty, isNil } from 'lodash'
import DropboxSignSdk from '../../../common/sdk/dropboxSignSdk'

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
        customFields,
      },
      settings: { apiKey },
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

      if (!isNil(customFields)) {
        if (!Array.isArray(customFields)) {
          await onError({
            events: [
              {
                date: new Date().toISOString(),
                text: { en: 'Incorrect values for fields' },
                error: {
                  category: 'WRONG_INPUT',
                  message: '`customFields` should be an array of objects.',
                },
              },
            ],
          })
          return
        }
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
        customFields,
        signingOptions: defaultSigningOptions,
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
