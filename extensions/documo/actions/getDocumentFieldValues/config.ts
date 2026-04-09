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
      'Unique identifier (UUID) of the document to retrieve field values for.',
  },
} satisfies Fields

export const dataPoints = {
  fieldValues: {
    key: 'fieldValues',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>

export const FieldsSchema = z.object({
  workspaceId: z.string().min(1),
  documentId: z.string().min(1),
})
