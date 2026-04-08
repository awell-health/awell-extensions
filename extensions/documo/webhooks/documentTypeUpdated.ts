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
  documentName: {
    key: 'documentName',
    valueType: 'string',
  },
  sourceType: {
    key: 'sourceType',
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

const WorkspaceSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const DocumentSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  name: z.string(),
  sourceType: z.string(),
  sourceId: z.string(),
  from: z.string().nullable(),
  to: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  addedAt: z.string(),
  pagesCount: z.number(),
  typeId: z.string(),
  statusId: z.string(),
  isUploading: z.boolean(),
})

const TypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  accountId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  locked: z.boolean(),
})

const UserSchema = z.object({
  uuid: z.string(),
  accountId: z.string(),
  email: z.string(),
})

const DocumentTypeUpdatedPayloadSchema = z.object({
  workspace: WorkspaceSchema,
  document: DocumentSchema,
  type: TypeSchema,
  user: UserSchema,
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
        documentId: parsed.document.id,
        workspaceId: parsed.workspace.id,
        documentName: parsed.document.name,
        sourceType: parsed.document.sourceType,
        typeName: parsed.type.name,
        typeId: parsed.type.id,
        userEmail: parsed.user.email,
      },
    })
  },
}

export type DocumentTypeUpdated = typeof documentTypeUpdated
