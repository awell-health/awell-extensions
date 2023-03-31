import { type Action } from '@/types'
import { fields } from './config'
import { Category } from '@/types/marketplace'
import { type settings } from '../../../settings'
import { isEmpty, isNil } from 'lodash'
import DropboxSignSdk from '@/extensions/dropboxSign/common/sdk/dropboxSignSdk'

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
        customFields,
      },
      settings: { apiKey, clientId },
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

      if (!Array.isArray(customFields)) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'Incorrect values for fields' },
              error: {
                category: 'INCORRECT_FIELDS',
                message: '`customFields` should be an array of objects.',
              },
            },
          ],
        })
        return
      }

      if (isNil(apiKey) || isEmpty(clientId)) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: { en: 'Missing API key or Client ID' },
              error: {
                category: 'MISSING_SETTINGS',
                message: 'Missing the API key or Client ID',
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

      const data: DropboxSignSdk.SignatureRequestCreateEmbeddedWithTemplateRequest =
        {
          clientId: String(clientId),
          templateIds: [String(templateId)],
          subject,
          message,
          signers: [signer],
          title,
          customFields,
          signingOptions: defaultSigningOptions,
          /**
           * Keep in test mode for now
           */
          testMode: true,
          metadata: {
            awellPatientId: patientId,
            awellActivityId: activityId,
          },
        }

      signatureRequestApi
        .signatureRequestCreateEmbeddedWithTemplate(data)
        .then(async (res) => {
          const embeddedApi = new DropboxSignSdk.EmbeddedApi()
          embeddedApi.username = apiKey

          const signatures = res.body.signatureRequest?.signatures ?? []
          const signatureId = signatures[0].signatureId

          if (isEmpty(signatures) || isEmpty(signatureId)) {
            await onError({
              events: [
                {
                  date: new Date().toISOString(),
                  text: { en: 'No signatures found.' },
                  error: {
                    category: 'SERVER_ERROR',
                    message: `No signatures found for embedded signature request with id ${String(
                      res.body.signatureRequest?.signatureRequestId
                    )}`,
                  },
                },
              ],
            })
          }

          return await embeddedApi.embeddedSignUrl(String(signatureId))
        })
        .then((res) => {
          const signUrl = String(res.body.embedded?.signUrl)
          /**
           * Somehow I need to be able to pass the Sign URL to the front-end (Awell Hosted Pages)
           * so it can use the `hellosign-embedded` sdk to open the URL in the front-end.
           *
           * What would make sense is that I can append the signUrl to the activity object so I can
           * access it in Orchestration.
           */
          console.log('The sign url: ' + signUrl)
        })
        .catch(async () => {
          await onError({
            events: [
              {
                date: new Date().toISOString(),
                text: {
                  en: 'Could not create embedded signature request with template and retrieve sign URL.',
                },
                error: {
                  category: 'SERVER_ERROR',
                  message:
                    'Could not create embedded signature request with template and retrieve sign URL.',
                },
              },
            ],
          })
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
