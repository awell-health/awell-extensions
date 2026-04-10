import { z } from 'zod'
import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'

const dataPoints = {
  webhookData: {
    key: 'webhookData',
    valueType: 'json',
  },
  documentId: {
    key: 'documentId',
    valueType: 'string',
  },
  workspaceId: {
    key: 'workspaceId',
    valueType: 'string',
  },
  typeName: {
    key: 'typeName',
    valueType: 'string',
  },
  typeId: {
    key: 'typeId',
    valueType: 'string',
  },
  userEmail: {
    key: 'userEmail',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

const TypeSchema = z.object({
  id: z.string(),
  name: z.string(),
})

const UserSchema = z.object({
  id: z.string(),
  email: z.string(),
})

const DocumentTypeUpdatedPayloadSchema = z.object({
  accountId: z.string(),
  workspaceId: z.string(),
  documentId: z.string(),
  user: UserSchema,
  type: TypeSchema,
})

export type DocumentTypeUpdatedPayload = z.infer<
  typeof DocumentTypeUpdatedPayloadSchema
>

export const documentTypeUpdated: Webhook<
  keyof typeof dataPoints,
  DocumentTypeUpdatedPayload
> = {
  key: 'documentTypeUpdated',
  description: 'Triggered when a document type is updated in Documo.',
  dataPoints,
  onEvent: async ({ payload: { payload }, onSuccess }) => {
    const parsed = DocumentTypeUpdatedPayloadSchema.parse(payload)

    await onSuccess({
      data_points: {
        webhookData: JSON.stringify(payload),
        documentId: parsed.documentId,
        workspaceId: parsed.workspaceId,
        typeName: parsed.type.name,
        typeId: parsed.type.id,
        userEmail: parsed.user.email,
      },
    })
  },
}

export type DocumentTypeUpdated = typeof documentTypeUpdated
