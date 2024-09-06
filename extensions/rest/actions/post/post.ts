import { type Action } from '@awell-health/extensions-core'
import { Category, validate } from '@awell-health/extensions-core'
import { type settings } from '../../settings'
import { FieldsValidationSchema, dataPoints, fields } from './config'
import { z } from 'zod'
import { FetchError } from '../../lib/errors'
import { isEmpty } from 'lodash'

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

    try {
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

      if (response.ok) {
        const getResponseBody = async (
          response: Response
        ): Promise<string | object> => {
          const res = await response.text()

          try {
            const jsonRes = JSON.parse(res)
            return jsonRes
          } catch (e) {
            return isEmpty(res) ? 'No content' : res
          }
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
      } else {
        throw new FetchError(
          response.status,
          response.statusText,
          response.body
        )
      }
    } catch (error) {
      if (error instanceof FetchError) {
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: {
                en: `${error.message} ${error.responseBody}`,
              },
              error: {
                category: 'SERVER_ERROR',
                message: `${error.message} ${error.responseBody}`,
              },
            },
          ],
        })
      } else {
        const parsedError = error as Error
        await onError({
          events: [
            {
              date: new Date().toISOString(),
              text: {
                en: parsedError.message ?? 'Unexpected error',
              },
              error: {
                category: 'SERVER_ERROR',
                message: parsedError.message ?? 'Unexpected error',
              },
            },
          ],
        })
      }
    }
  },
}
