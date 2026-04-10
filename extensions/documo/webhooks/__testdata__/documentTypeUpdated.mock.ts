import { type DocumentTypeUpdatedPayload } from '../documentTypeUpdated'

/**
 * Mock payload matching the real Documo document-type.updated webhook payload
 */
export const fullPayload: DocumentTypeUpdatedPayload = {
  accountId: 'c6c25094-c753-4712-9a13-f883839e7a55',
  workspaceId: '41da08f1-f736-479e-a146-4ade8888fff9',
  documentId: '39960bdb-c1c8-464d-bbb0-343e6be551bf',
  user: {
    id: 'd86e651c-e562-4ab5-a288-47883fc9b774',
    email: 'jonathan@awellhealth.com',
  },
  type: {
    id: '6d3ad756-7e43-43a7-ab4b-0af67ab2ba44',
    name: 'Other',
  },
}

/**
 * Mock payload with different type name
 */
export const alternateTypePayload: DocumentTypeUpdatedPayload = {
  accountId: 'c6c25094-c753-4712-9a13-f883839e7a55',
  workspaceId: '41da08f1-f736-479e-a146-4ade8888fff9',
  documentId: '22222222-2222-2222-2222-222222222222',
  user: {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'admin@example.com',
  },
  type: {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'admission form',
  },
}

/**
 * Mock payload with user set to null — invalid per the Documo API schema.
 * Used to verify that Zod parsing rejects malformed payloads at the boundary.
 */
export const withoutUserPayload = {
  accountId: 'c6c25094-c753-4712-9a13-f883839e7a55',
  workspaceId: '41da08f1-f736-479e-a146-4ade8888fff9',
  documentId: '39960bdb-c1c8-464d-bbb0-343e6be551bf',
  user: null,
  type: {
    id: '6d3ad756-7e43-43a7-ab4b-0af67ab2ba44',
    name: 'Other',
  },
}
