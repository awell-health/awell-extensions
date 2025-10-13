import { type Action } from '@awell-health/extensions-core'
import DocuSignSdk from 'docusign-esign'
import { Category } from '@awell-health/extensions-core'
import { fromZodError } from 'zod-validation-error'
import { fields, dataPoints, validateActionFields } from './config'
import { validateSettings, type settings } from '../../settings'
import { ZodError } from 'zod'
import { createApiClient } from '../createEmbeddedSignatureRequestWithTemplate/config/createClient'
import { instanceOfDocuSignError } from '../createEmbeddedSignatureRequestWithTemplate/config/types'
import { replaceStringVariables } from '../createEmbeddedSignatureRequestWithTemplate/config/utils'

export const createSequentialEmbeddedSignatureRequest: Action<
  typeof fields,
  typeof settings
> = {
  key: 'createSequentialEmbeddedSignatureRequest',
  title: 'Create sequential embedded signature request',
  description:
    'Create an embedded signature request with sequential signing. The patient signs first (routing order 1), then the provider signs second (routing order 2) on the same tablet device.',
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
        templateId,
        subject,
        message,
        patientSignerRole,
        patientSignerName,
        patientSignerEmail,
        providerSignerRole,
        providerSignerName,
        providerSignerEmail,
        providerClientUserId,
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

      const patientSigner = DocuSignSdk.TemplateRole.constructFromObject({
        email: patientSignerEmail,
        name: patientSignerName,
        roleName: patientSignerRole,
        clientUserId: patientId,
        routingOrder: '1',
      })

      const providerSigner = DocuSignSdk.TemplateRole.constructFromObject({
        email: providerSignerEmail,
        name: providerSignerName,
        roleName: providerSignerRole,
        clientUserId: providerClientUserId,
        routingOrder: '2',
      })

      const envelope = DocuSignSdk.EnvelopeDefinition.constructFromObject({
        status: 'sent',
        templateId,
        templateRoles: [patientSigner, providerSigner],
        emailSubject: subject,
        emailBlurb: message,
      })

      const envelopesApi = new DocuSignSdk.EnvelopesApi(client)

      const envelopeResult = await envelopesApi.createEnvelope(accountId, {
        envelopeDefinition: envelope,
      })

      const patientViewRequest = DocuSignSdk.RecipientViewRequest.constructFromObject({
        authenticationMethod: 'none',
        email: patientSignerEmail,
        userName: patientSignerName,
        clientUserId: patientId,
        returnUrl: replaceStringVariables(returnUrlTemplate, {
          sessionId: sessionId ?? '',
          stakeholderId: patientId,
          pathwayId,
          activityId,
        }),
      })

      const patientViewResult = await envelopesApi.createRecipientView(
        accountId,
        envelopeResult?.envelopeId ?? '',
        {
          recipientViewRequest: patientViewRequest,
        }
      )

      const providerViewRequest = DocuSignSdk.RecipientViewRequest.constructFromObject({
        authenticationMethod: 'none',
        email: providerSignerEmail,
        userName: providerSignerName,
        clientUserId: providerClientUserId,
        returnUrl: replaceStringVariables(returnUrlTemplate, {
          sessionId: sessionId ?? '',
          stakeholderId: providerClientUserId,
          pathwayId,
          activityId,
        }),
      })

      const providerViewResult = await envelopesApi.createRecipientView(
        accountId,
        envelopeResult?.envelopeId ?? '',
        {
          recipientViewRequest: providerViewRequest,
        }
      )

      await onComplete({
        data_points: {
          envelopeId: envelopeResult?.envelopeId,
          patientSignUrl: patientViewResult?.url,
          providerSignUrl: providerViewResult?.url,
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

      const error = err as Error
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: 'Something went wrong while orchestrating the action' },
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
