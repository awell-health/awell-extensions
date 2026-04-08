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

interface WorkspaceInfo {
  id: string
  accountId: string
  name: string
  createdAt: string
  updatedAt: string
}

interface DocumentInfo {
  id: string
  workspaceId: string
  name: string
  sourceType: string
  sourceId: string
  from: string | null
  to: string | null
  createdAt: string
  updatedAt: string
  addedAt: string
  pagesCount: number
  typeId: string
  statusId: string
  isUploading: boolean
}

interface TypeInfo {
  id: string
  name: string
  accountId: string
  createdAt: string
  updatedAt: string
  locked: boolean
}

interface UserInfo {
  uuid: string
  accountId: string
  email: string
}

export interface DocumentTypeUpdatedPayload {
  workspace: WorkspaceInfo
  document: DocumentInfo
  type: TypeInfo
  user: UserInfo
}

export const documentTypeUpdated: Webhook<
  keyof typeof dataPoints,
  DocumentTypeUpdatedPayload
> = {
  key: 'documentTypeUpdated',
  description: 'Triggered when a document type is updated in Documo.',
  dataPoints,
  onEvent: async ({ payload: { payload }, onSuccess }) => {
    await onSuccess({
      data_points: {
        webhookData: JSON.stringify(payload),
        documentId: payload.document?.id ?? '',
        workspaceId: payload.workspace?.id ?? '',
        documentName: payload.document?.name ?? '',
        sourceType: payload.document?.sourceType ?? '',
        typeName: payload.type?.name ?? '',
        typeId: payload.type?.id ?? '',
        userEmail: payload.user?.email ?? '',
      },
    })
  },
}

export type DocumentTypeUpdated = typeof documentTypeUpdated
