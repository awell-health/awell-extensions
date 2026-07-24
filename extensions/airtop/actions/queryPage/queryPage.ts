import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib/validatePayloadAndCreateSdk'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'
import { isNil } from 'lodash'

export const queryPage: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'queryPage',
  category: Category.DATA,
  title: 'Query web page with LLM',
  description: 'Query a web page using LLMs with Airtop’s.',
  fields,
  previewable: true,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError, helpers }): Promise<void> => {
    helpers.log({ fields: payload.fields }, 'Processing queryPage')

    try {
      const { fields, airtopSdk } = await validatePayloadAndCreateSdk({
        fieldsSchema: FieldsValidationSchema,
        payload,
      })

      // Create a headless browser session
      const session = await airtopSdk.sessions.create()

      // Create a new window in the session and open the page
      const createWindowRequest = {
        url: fields.pageUrl,
      }
      helpers.log({ createWindowRequest }, 'Creating Airtop window')
      const window = await airtopSdk.windows.create(
        session.data.id,
        createWindowRequest,
      )

      // query the content of the window using the prompt
      const pageQueryRequest = {
        prompt: fields.prompt,
        configuration: {
          outputSchema: fields.jsonSchema,
        },
      }
      helpers.log({ pageQueryRequest }, 'Querying Airtop page')
      const result = await airtopSdk.windows.pageQuery(
        session.data.id,
        window.data.windowId,
        pageQueryRequest,
      )

      // Close the window and terminate the session
      await airtopSdk.windows.close(session.data.id, window.data.windowId)
      await airtopSdk.sessions.terminate(session.data.id)

      const content = result.data.modelResponse

      // Return the result
      await onComplete({
        data_points: {
          result: isNil(fields.jsonSchema) ? content : content,
          resultJson: isNil(fields.jsonSchema) ? undefined : content,
        },
      })
    } catch (err) {
      helpers.log({ err }, 'error', err as Error)
      const error = err as Error
      await onError({
        events: [
          {
            date: new Date().toISOString(),
            text: { en: error.message },
            error: {
              category: 'SERVER_ERROR',
              message: error.message,
            },
          },
        ],
      })
    }
  },
}
