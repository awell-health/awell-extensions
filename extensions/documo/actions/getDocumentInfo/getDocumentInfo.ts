import { z } from 'zod'
import { Category, validate, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsSchema } from './config'

const DOCUMO_API_BASE = 'https://api.documo.com'

const SettingsSchema = z.object({
  apiKey: z.string().min(1),
})

export const getDocumentInfo: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getDocumentInfo',
  title: 'Get Document Info',
  description:
    'Retrieve metadata about a specific document in a Documo workspace.',
  category: Category.DOCUMENT_MANAGEMENT,
  fields,
  dataPoints,
  previewable: true,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const {
      fields: { workspaceId, documentId },
      settings: { apiKey },
    } = validate({
      schema: z.object({
        fields: FieldsSchema,
        settings: SettingsSchema,
      }),
      payload,
    })

    const url = `${DOCUMO_API_BASE}/ws/v2/workspaces/${encodeURIComponent(workspaceId)}/documents/${encodeURIComponent(documentId)}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: {
              en: `Documo API error (${response.status}): ${errorBody}`,
            },
            error: {
              category: 'SERVER_ERROR',
              message: `Documo API returned ${response.status}: ${errorBody}`,
            },
          },
        ],
      })
      return
    }

    const data = await response.json()

    await onComplete({
      data_points: {
        id: data.id,
        name: data.name,
        workspaceId: data.workspaceId,
        createdAt: data.createdAt,
        addedAt: data.addedAt,
        isUploading: String(data.isUploading),
        pagesCount: data.pagesCount != null ? String(data.pagesCount) : '',
        from: data.from ?? '',
        to: data.to ?? '',
        sourceType: data.sourceType,
        sourceId: data.sourceId ?? '',
        statusName: data.status?.name ?? '',
        typeName: data.type?.name ?? '',
        workspaceName: data.workspace?.name ?? '',
        documentResponse: JSON.stringify(data),
      },
    })
  },
}
