import { type Action, validate } from '@awell-health/extensions-core'
import DocuSignSdk from 'docusign-esign'
import { Category } from '@awell-health/extensions-core'
import { z } from 'zod'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { SettingsValidationSchema, type settings } from '../../settings'
import { createApiClient } from '../createEmbeddedSignatureRequestWithTemplate/config/createClient'
import { instanceOfDocuSignError } from '../createEmbeddedSignatureRequestWithTemplate/config/types'
import { replaceStringVariables } from '../createEmbeddedSignatureRequestWithTemplate/config/utils'

export const generateSignUrlForExistingEnvelope: Action<
  typeof fields,
  typeof settings
> = {
  key: 'generateSignUrlForExistingEnvelope',
  title: 'Generate sign URL for existing envelope',
  description:
    'Generate a signing URL for a recipient in an existing DocuSign envelope. Useful for sequential signing workflows where multiple people sign the same document in order.',
  category: Category.DOCUMENT_MANAGEMENT,
  fields,
  dataPoints,
  previewable: true,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const {
      patient: { id: patientId },
      pathway: { id: pathwayId },
      activity: { id: activityId, sessionId },
    } = payload

    const {
      settings: {
        accountId,
        baseApiUrl,
        returnUrlTemplate,
        integrationKey,
        rsaKey,
        userId,
      },
      fields: { envelopeId, signerName, signerEmail, clientUserId },
    } = validate({
      schema: z.object({
        settings: SettingsValidationSchema,
        fields: FieldsValidationSchema,
      }),
      payload,
    })

    try {
      const client = await createApiClient({
        integrationKey,
        userId,
        rsaKey,
        baseUrl: baseApiUrl,
      })

      const envelopesApi = new DocuSignSdk.EnvelopesApi(client)

      const viewRequest = DocuSignSdk.RecipientViewRequest.constructFromObject({
        authenticationMethod: 'none',
        email: signerEmail,
        userName: signerName,
        clientUserId,
        returnUrl: replaceStringVariables(returnUrlTemplate, {
          sessionId: sessionId ?? '',
          stakeholderId: clientUserId,
          pathwayId,
          activityId,
        }),
      })

      const viewResult = await envelopesApi.createRecipientView(
        accountId,
        envelopeId,
        {
          recipientViewRequest: viewRequest,
        }
      )

      await onComplete({
        data_points: {
          signUrl: viewResult?.url,
        },
      })
    } catch (err) {
      if (instanceOfDocuSignError(err)) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: {
                en: `DocuSign reported an error: ${err.response.text}`,
              },
              error: {
                category: 'BAD_REQUEST',
                message: `DocuSign error (${String(err.response.status)}): ${err.response.text}`,
              },
            },
          ],
        })
        return
      }

      throw err
    }
  },
}
