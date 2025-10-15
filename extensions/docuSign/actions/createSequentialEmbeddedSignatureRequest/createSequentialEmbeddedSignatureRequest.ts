import { type Action, validate } from '@awell-health/extensions-core'
import DocuSignSdk from 'docusign-esign'
import { Category } from '@awell-health/extensions-core'
import { z } from 'zod'
import { fields, dataPoints, FieldsValidationSchema } from './config'
import { SettingsValidationSchema, type settings } from '../../settings'
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
    'Create an embedded signature request with sequential signing. Adds both patient (routing order 1) and provider (routing order 2) to the envelope, but only generates the patient sign URL. Use "Generate sign URL for existing envelope" action after patient signs to get the provider URL.',
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
      fields: {
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
      },
    } = validate({
      schema: z.object({
        settings: SettingsValidationSchema,
        fields: FieldsValidationSchema,
      }),
      payload,
    })

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

    try {
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

      await onComplete({
        data_points: {
          envelopeId: envelopeResult?.envelopeId,
          patientSignUrl: patientViewResult?.url,
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
