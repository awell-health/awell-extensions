import { type Action } from '@awell-health/extensions-core'
import DocuSignSdk from 'docusign-esign'
import { Category } from '@awell-health/extensions-core'
import { fields, dataPoints, validateActionFields } from './config'
import { validateSettings, type settings } from '../../settings'
import { createApiClient } from './config/createClient'
import { instanceOfDocuSignError } from './config/types'
import { replaceStringVariables } from './config/utils'

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
        pathway: { id: pathwayId },
        activity: { id: activityId, sessionId },
      } = payload

      const {
        signerRole,
        signerName,
        signerEmailAddress,
        templateId,
        subject,
        message,
      } = validateActionFields(payload.fields)
      const {
        accountId,
        baseApiUrl,
        returnUrlTemplate,
        integrationKey,
        rsaKey,
        userId,
      } = validateSettings(payload.settings)

      const client = await createApiClient({
        integrationKey,
        userId,
        rsaKey,
        baseUrl: baseApiUrl,
      })

      const signer = DocuSignSdk.TemplateRole.constructFromObject({
        email: signerEmailAddress,
        name: signerName,
        roleName: signerRole,
        clientUserId: patientId,
      })

      const envelope = DocuSignSdk.EnvelopeDefinition.constructFromObject({
        status: 'sent',
        templateId,
        templateRoles: [signer],
        emailSubject: subject,
        emailBlurb: message,
      })

      const envelopesApi = new DocuSignSdk.EnvelopesApi(client)

      const envelopeResult = await envelopesApi.createEnvelope(accountId, {
        envelopeDefinition: envelope,
      })

      const viewRequest = DocuSignSdk.RecipientViewRequest.constructFromObject({
        authenticationMethod: 'none',
        email: signerEmailAddress,
        userName: signerName,
        clientUserId: patientId,
        returnUrl: replaceStringVariables(returnUrlTemplate, {
          sessionId,
          stakeholderId: patientId,
          pathwayId,
          activityId,
        }),
      })

      const viewRequestResult = await envelopesApi.createRecipientView(
        accountId,
        envelopeResult?.envelopeId ?? '',
        {
          recipientViewRequest: viewRequest,
        }
      )

      await onComplete({
        data_points: {
          envelopeId: envelopeResult?.envelopeId,
          signUrl: viewRequestResult?.url,
        },
      })
    } catch (err) {
      if (instanceOfDocuSignError(err)) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: {
                en: err.response.text,
              },
              error: {
                category: 'SERVER_ERROR',
                message: `${String(err.response.status)}: ${err.response.text}`,
              },
            },
          ],
        })
        return
      }

      // re-throw to be handled inside awell-extension-server
      throw err
    }
  },
}
