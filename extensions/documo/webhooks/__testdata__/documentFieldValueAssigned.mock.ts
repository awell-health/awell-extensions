import { type DocumentFieldValueAssignedPayload } from '../documentFieldValueAssigned'

/**
 * Mock payload with all fields populated
 */
export const fullPayload: DocumentFieldValueAssignedPayload = {
  accountId: 'account-123',
  workspaceId: 'workspace-456',
  documentId: 'document-789',
  document: {
    isUploading: false,
    createdAt: '2026-01-28T15:12:25.215Z',
    id: 'document-789',
    name: 'test-document',
    sourceType: 'upload',
    sourceId: 'source-abc',
    from: null,
    to: null,
    pagesCount: 8,
  },
  user: null,
  assignments: [
    {
      fieldId: 'field-1',
      valueText: 'John',
      valueDate: null,
      valueArray: null,
      valueObject: null,
      order: 1,
      name: 'Patient First Name',
      type: 'text',
      dateFlag: null,
    },
    {
      fieldId: 'field-2',
      valueText: 'Doe',
      valueDate: null,
      valueArray: null,
      valueObject: null,
      order: 2,
      name: 'Patient Last Name',
      type: 'text',
      dateFlag: null,
    },
    {
      fieldId: 'field-3',
      valueText: '80202-5544',
      valueDate: null,
      valueArray: null,
      valueObject: null,
      order: 5,
      name: 'Patient Zip Code',
      type: 'text',
      dateFlag: null,
    },
    {
      fieldId: 'field-4',
      valueText: null,
      valueDate: null,
      valueArray: ['MRN123456', 'INS789012'],
      valueObject: null,
      order: 8,
      name: 'Patient Identifiers',
      type: 'text_array',
      dateFlag: null,
    },
    {
      fieldId: 'field-5',
      valueText: '555-123-4567',
      valueDate: null,
      valueArray: null,
      valueObject: null,
      order: 9,
      name: 'Patient Phone Number',
      type: 'text',
      dateFlag: null,
    },
    {
      fieldId: 'field-6',
      valueText: 'Dr. Smith, Primary Care',
      valueDate: null,
      valueArray: null,
      valueObject: null,
      order: 10,
      name: 'Receiving Provider Full Name',
      type: 'text',
      dateFlag: null,
    },
  ],
}

/**
 * Mock payload with only phone number
 */
export const phoneOnlyPayload: DocumentFieldValueAssignedPayload = {
  accountId: 'account-123',
  workspaceId: 'workspace-456',
  documentId: 'document-789',
  document: {
    isUploading: false,
    createdAt: '2026-01-20T16:05:04.476Z',
    id: 'document-789',
    name: 'phone-only-doc',
    sourceType: 'upload',
    sourceId: 'source-abc',
    from: null,
    to: null,
    pagesCount: 2,
  },
  user: null,
  assignments: [
    {
      fieldId: 'field-5',
      valueText: '720-862-4005',
      valueDate: null,
      valueArray: null,
      valueObject: null,
      order: 9,
      name: 'Patient Phone Number',
      type: 'text',
      dateFlag: null,
    },
  ],
}

/**
 * Mock payload with no mapped fields
 */
export const unmappedFieldsPayload: DocumentFieldValueAssignedPayload = {
  accountId: 'account-123',
  workspaceId: 'workspace-456',
  documentId: 'document-789',
  document: {
    isUploading: false,
    createdAt: '2026-01-20T16:05:04.476Z',
    id: 'document-789',
    name: 'unmapped-doc',
    sourceType: 'upload',
    sourceId: 'source-abc',
    from: null,
    to: null,
    pagesCount: 1,
  },
  user: null,
  assignments: [
    {
      fieldId: 'field-unknown',
      valueText: 'Some unknown value',
      valueDate: null,
      valueArray: null,
      valueObject: null,
      order: 1,
      name: 'Unknown Field Name',
      type: 'text',
      dateFlag: null,
    },
  ],
}

/**
 * Mock payload with empty assignments
 */
export const emptyAssignmentsPayload: DocumentFieldValueAssignedPayload = {
  accountId: 'account-123',
  workspaceId: 'workspace-456',
  documentId: 'document-789',
  document: {
    isUploading: false,
    createdAt: '2026-01-20T16:05:04.476Z',
    id: 'document-789',
    name: 'empty-doc',
    sourceType: 'upload',
    sourceId: 'source-abc',
    from: null,
    to: null,
    pagesCount: 1,
  },
  user: null,
  assignments: [],
}

/**
 * Mock payload with user present
 */
export const withUserPayload: DocumentFieldValueAssignedPayload = {
  accountId: 'account-123',
  workspaceId: 'workspace-456',
  documentId: 'document-789',
  document: {
    isUploading: false,
    createdAt: '2026-01-20T16:05:04.476Z',
    id: 'document-789',
    name: 'with-user-doc',
    sourceType: 'upload',
    sourceId: 'source-abc',
    from: null,
    to: null,
    pagesCount: 2,
  },
  user: {
    id: 'user-123',
    email: 'user@example.com',
  },
  assignments: [
    {
      fieldId: 'field-1',
      valueText: 'Jane',
      valueDate: null,
      valueArray: null,
      valueObject: null,
      order: 1,
      name: 'Patient First Name',
      type: 'text',
      dateFlag: null,
    },
  ],
}
