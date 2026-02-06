import { z } from 'zod'

import {
  type Fields,
  type DataPointDefinition,
  FieldType,
} from '@awell-health/extensions-core'

export const fields = {
  workspaceId: {
    id: 'workspaceId',
    label: 'Workspace ID',
    type: FieldType.STRING,
    required: true,
    description:
      'Unique identifier (UUID) of the workspace the document belongs to.',
  },
  documentId: {
    id: 'documentId',
    label: 'Document ID',
    type: FieldType.STRING,
    required: true,
    description:
      'Unique identifier (UUID) of the document to retrieve.',
  },
} satisfies Fields

export const dataPoints = {
  id: {
    key: 'id',
    valueType: 'string',
  },
  name: {
    key: 'name',
    valueType: 'string',
  },
  workspaceId: {
    key: 'workspaceId',
    valueType: 'string',
  },
  createdAt: {
    key: 'createdAt',
    valueType: 'date',
  },
  addedAt: {
    key: 'addedAt',
    valueType: 'date',
  },
  isUploading: {
    key: 'isUploading',
    valueType: 'boolean',
  },
  pagesCount: {
    key: 'pagesCount',
    valueType: 'number',
  },
  from: {
    key: 'from',
    valueType: 'string',
  },
  to: {
    key: 'to',
    valueType: 'string',
  },
  sourceType: {
    key: 'sourceType',
    valueType: 'string',
  },
  sourceId: {
    key: 'sourceId',
    valueType: 'string',
  },
  statusName: {
    key: 'statusName',
    valueType: 'string',
  },
  typeName: {
    key: 'typeName',
    valueType: 'string',
  },
  workspaceName: {
    key: 'workspaceName',
    valueType: 'string',
  },
  documentResponse: {
    key: 'documentResponse',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>

export const FieldsSchema = z.object({
  workspaceId: z.string().min(1),
  documentId: z.string().min(1),
})
