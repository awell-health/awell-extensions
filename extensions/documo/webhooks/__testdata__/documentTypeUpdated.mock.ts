import { type DocumentTypeUpdatedPayload } from '../documentTypeUpdated'

/**
 * Mock payload with all fields populated
 */
export const fullPayload: DocumentTypeUpdatedPayload = {
  workspace: {
    id: '00000000-0000-0000-0000-000000000000',
    accountId: 'account-111',
    name: 'Test Workspace',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-06-15T12:00:00.000Z',
  },
  document: {
    id: '22222222-2222-2222-2222-222222222222',
    workspaceId: '00000000-0000-0000-0000-000000000000',
    name: 'patient-intake-form.pdf',
    sourceType: 'fax',
    sourceId: 'source-fax-001',
    from: '+15551234567',
    to: '+15559876543',
    createdAt: '2025-06-15T10:00:00.000Z',
    updatedAt: '2025-06-15T12:30:00.000Z',
    addedAt: '2025-06-15T10:00:00.000Z',
    pagesCount: 3,
    typeId: '33333333-3333-3333-3333-333333333333',
    statusId: 'status-active',
    isUploading: false,
  },
  type: {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'admission form',
    accountId: 'account-111',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-06-15T12:30:00.000Z',
    locked: false,
  },
  user: {
    uuid: '44444444-4444-4444-4444-444444444444',
    accountId: 'account-111',
    email: 'admin@example.com',
  },
}

/**
 * Mock payload where optional/nullable fields are null or missing
 */
export const minimalPayload: DocumentTypeUpdatedPayload = {
  workspace: {
    id: '00000000-0000-0000-0000-000000000000',
    accountId: 'account-111',
    name: 'Test Workspace',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-06-15T12:00:00.000Z',
  },
  document: {
    id: '22222222-2222-2222-2222-222222222222',
    workspaceId: '00000000-0000-0000-0000-000000000000',
    name: 'minimal-doc.pdf',
    sourceType: 'upload',
    sourceId: 'source-upload-001',
    from: null,
    to: null,
    createdAt: '2025-06-15T10:00:00.000Z',
    updatedAt: '2025-06-15T12:30:00.000Z',
    addedAt: '2025-06-15T10:00:00.000Z',
    pagesCount: 1,
    typeId: '33333333-3333-3333-3333-333333333333',
    statusId: 'status-active',
    isUploading: false,
  },
  type: {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'admission form',
    accountId: 'account-111',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-06-15T12:30:00.000Z',
    locked: false,
  },
  user: {
    uuid: '44444444-4444-4444-4444-444444444444',
    accountId: 'account-111',
    email: 'admin@example.com',
  },
}

/**
 * Mock payload with user set to null — invalid per the Documo API schema.
 * Used to verify that Zod parsing rejects malformed payloads at the boundary.
 */
export const withoutUserPayload = {
  workspace: {
    id: '00000000-0000-0000-0000-000000000000',
    accountId: 'account-111',
    name: 'Test Workspace',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-06-15T12:00:00.000Z',
  },
  document: {
    id: '22222222-2222-2222-2222-222222222222',
    workspaceId: '00000000-0000-0000-0000-000000000000',
    name: 'no-user-doc.pdf',
    sourceType: 'email',
    sourceId: 'source-email-001',
    from: null,
    to: null,
    createdAt: '2025-06-15T10:00:00.000Z',
    updatedAt: '2025-06-15T12:30:00.000Z',
    addedAt: '2025-06-15T10:00:00.000Z',
    pagesCount: 2,
    typeId: '33333333-3333-3333-3333-333333333333',
    statusId: 'status-active',
    isUploading: false,
  },
  type: {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'admission form',
    accountId: 'account-111',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-06-15T12:30:00.000Z',
    locked: false,
  },
  user: null,
}
