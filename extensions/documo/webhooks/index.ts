import { ocrDocumentCompleted } from './ocrDocumentCompleted'
import { documentFieldValueAssigned } from './documentFieldValueAssigned'
import { documentTypeUpdated } from './documentTypeUpdated'

export const webhooks = [
  ocrDocumentCompleted,
  documentFieldValueAssigned,
  documentTypeUpdated,
]
