import { z } from 'zod'
import { Category, validate, type Action } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { fields, dataPoints, FieldsSchema } from './config'

const DOCUMO_API_BASE = 'https://api.documo.com'

const SettingsSchema = z.object({
  apiKey: z.string().min(1),
})

export const getDocumentFieldValues: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'getDocumentFieldValues',
  title: 'Get Document Field Values',
  description:
    'Retrieve field values for a specific document in a Documo workspace.',
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

    const url = `${DOCUMO_API_BASE}/ws/v2/workspaces/${encodeURIComponent(workspaceId)}/documents/${encodeURIComponent(documentId)}/field-values`

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
        fieldValues: JSON.stringify(data),
      },
    })
  },
}
