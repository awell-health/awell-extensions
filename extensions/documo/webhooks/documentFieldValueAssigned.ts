import {
  type DataPointDefinition,
  type Webhook,
} from '@awell-health/extensions-core'

const dataPoints = {
  webhookData: {
    key: 'webhookData',
    valueType: 'json',
  },
  patientFirstName: {
    key: 'patientFirstName',
    valueType: 'string',
  },
  patientLastName: {
    key: 'patientLastName',
    valueType: 'string',
  },
  patientZipCode: {
    key: 'patientZipCode',
    valueType: 'string',
  },
  patientIdentifiers: {
    key: 'patientIdentifiers',
    valueType: 'json',
  },
  patientMobilePhone: {
    key: 'patientMobilePhone',
    valueType: 'string',
  },
  receivingProviderFullName: {
    key: 'receivingProviderFullName',
    valueType: 'string',
  },
} satisfies Record<string, DataPointDefinition>

/**
 * Field assignment from the webhook payload
 */
interface FieldAssignment {
  fieldId: string
  valueText: string | null
  valueDate: string | null
  valueArray: unknown[] | null
  valueObject: Record<string, unknown> | null
  order: number
  name: string
  type: string
  dateFlag: string | null
}

/**
 * Document metadata from the webhook payload
 */
interface DocumentInfo {
  isUploading: boolean
  createdAt: string
  id: string
  name: string
  sourceType: string
  sourceId: string
  from: string | null
  to: string | null
  pagesCount: number
}

/**
 * User information from the webhook payload
 */
interface UserInfo {
  id: string
  email: string
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
  document: DocumentInfo
  user: UserInfo | null
  assignments: FieldAssignment[]
}

/**
 * Known field name mappings to data points
 * Keys are the field names as they appear in the Documo webhook
 * Values are the corresponding data point names
 */
const FIELD_NAME_MAPPINGS = {
  'Patient First Name': 'patientFirstName',
  'Patient Last Name': 'patientLastName',
  'Patient Zip Code': 'patientZipCode',
  'Patient Identifiers': 'patientIdentifiers',
  'Patient Phone Number': 'patientMobilePhone',
  'Receiving Provider Full Name': 'receivingProviderFullName',
} as const

type MappedFieldName = keyof typeof FIELD_NAME_MAPPINGS

/**
 * Extracts a field value by name from the assignments array
 */
function getFieldValueByName(
  assignments: FieldAssignment[],
  fieldName: string,
): string | null {
  const assignment = assignments.find((a) => a.name === fieldName)
  if (assignment == null) {
    return null
  }

  // Return the appropriate value based on type
  if (assignment.valueText != null) {
    return assignment.valueText
  }
  if (assignment.valueDate != null) {
    return assignment.valueDate
  }
  if (assignment.valueArray != null) {
    return JSON.stringify(assignment.valueArray)
  }
  if (assignment.valueObject != null) {
    return JSON.stringify(assignment.valueObject)
  }

  return null
}

/**
 * Extracts all mapped patient fields from assignments
 */
function extractPatientFields(
  assignments: FieldAssignment[],
): Record<string, string | null> {
  const result: Record<string, string | null> = {}

  for (const [documoFieldName, patientFieldName] of Object.entries(
    FIELD_NAME_MAPPINGS,
  )) {
    result[patientFieldName] = getFieldValueByName(
      assignments,
      documoFieldName as MappedFieldName,
    )
  }

  return result
}

export const documentFieldValueAssigned: Webhook<
  keyof typeof dataPoints,
  DocumentFieldValueAssignedPayload
> = {
  key: 'documentFieldValueAssigned',
  description:
    'This webhook is triggered when a field value is assigned to a document.',
  dataPoints,
  onEvent: async ({ payload: { payload }, onSuccess }) => {
    const { assignments } = payload

    // Extract mapped patient fields
    const patientFields = extractPatientFields(assignments)

    await onSuccess({
      data_points: {
        webhookData: JSON.stringify(payload),
        patientFirstName: patientFields.patientFirstName ?? '',
        patientLastName: patientFields.patientLastName ?? '',
        patientZipCode: patientFields.patientZipCode ?? '',
        patientIdentifiers: patientFields.patientIdentifiers ?? '',
        patientMobilePhone: patientFields.patientMobilePhone ?? '',
        receivingProviderFullName:
          patientFields.receivingProviderFullName ?? '',
      },
    })
  },
}

export type DocumentFieldValueAssigned = typeof documentFieldValueAssigned
