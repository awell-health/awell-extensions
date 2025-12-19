import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'

const dataPoints = {
  webhookData: {
    key: 'webhookData',
    valueType: 'json',
  },
} satisfies Record<string, DataPointDefinition>

interface FieldAssignment {
  field: {
    id: string
    name: string
  }
  value: string | null
}

/**
 * Document Field Value Assigned webhook payload
 * Event type: idp.v1.document-field-value.assigned
 * @see https://next.docs.documo.com/
 */
export interface DocumentFieldValueAssignedPayload {
  accountId: string
  workspaceId: string
  documentId: string
  status: string
  user: {
    id: string
    email: string
  }
  assignments: FieldAssignment[]
}

export const documentFieldValueAssigned: Webhook<
  keyof typeof dataPoints,
  DocumentFieldValueAssignedPayload
> = {
  key: 'documentFieldValueAssigned',
  description:
    'This webhook is triggered when a field value is assigned to a document.',
  dataPoints,
  onWebhookReceived: async ({ payload }, onSuccess) => {
    await onSuccess({
      data_points: {
        webhookData: JSON.stringify(payload),
      },
    })
  },
}

export type DocumentFieldValueAssigned = typeof documentFieldValueAssigned
