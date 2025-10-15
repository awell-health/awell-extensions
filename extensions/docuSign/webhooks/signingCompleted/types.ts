import { z } from 'zod'

/**
 * DocuSign Connect webhook payload schema
 * Based on: https://developers.docusign.com/platform/webhooks/connect/
 */
export const DocuSignWebhookPayloadSchema = z.object({
  event: z.string(),
  apiVersion: z.string().optional(),
  uri: z.string().optional(),
  retryCount: z.number().optional(),
  configurationId: z.string().optional(),
  generatedDateTime: z.string().optional(),
  data: z.object({
    accountId: z.string().optional(),
    userId: z.string().optional(),
    envelopeId: z.string(),
    envelopeSummary: z
      .object({
        status: z.string().optional(),
        documentsUri: z.string().optional(),
        recipientsUri: z.string().optional(),
        emailSubject: z.string().optional(),
        envelopeId: z.string().optional(),
        sentDateTime: z.string().optional(),
        statusChangedDateTime: z.string().optional(),
        completedDateTime: z.string().optional(),
      })
      .optional(),
    recipientId: z.string().optional(),
    recipientStatus: z.string().optional(),
    completedDateTime: z.string().optional(),
  }),
})

export type DocuSignWebhookPayload = z.infer<
  typeof DocuSignWebhookPayloadSchema
>
