import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { FieldsValidationSchema, dataPoints, fields } from './config'
import { z } from 'zod'

export const post: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'post',
  title: 'POST request',
  description: 'Make a POST request',
  category: Category.DATA,
  fields,
  dataPoints,
  previewable: true,
  onActivityCreated: async (payload, onComplete, onError) => {
    const {
      fields: { endpoint, headers, jsonPayload, additionalPayload },
    } = validate({
      schema: z.object({
        fields: FieldsValidationSchema,
      }),
      payload,
    })

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...jsonPayload,
        ...additionalPayload,
      }),
    })

    const getResponseBody = async (
      response: Response
    ): Promise<string | object> => {
      const contentType = response.headers.get('content-type') ?? ''
      if (contentType?.toLowerCase().includes('application/json')) {
        return await response.json()
      }
      return await response.text()
    }

    const responseBody = await getResponseBody(response)
    const statusCode = response.status

    await onComplete({
      data_points: {
        response:
          typeof responseBody === 'string'
            ? responseBody
            : JSON.stringify(responseBody),
        statusCode: String(statusCode),
      },
    })
  },
}
