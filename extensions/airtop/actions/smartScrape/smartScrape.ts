import { type Action } from '@awell-health/extensions-core'
import { Category } from '@awell-health/extensions-core'
import { validatePayloadAndCreateSdk } from '../../lib/validatePayloadAndCreateSdk'
import { type settings } from '../../settings'
import { fields, FieldsValidationSchema, dataPoints } from './config'

export const smartScrape: Action<
  typeof fields,
  typeof settings,
  keyof typeof dataPoints
> = {
  key: 'smartScrape',
  category: Category.DATA,
  title: 'Smart Scrape a web page',
  description: 'Scrape a web page with Airtop.',
  fields,
  previewable: false,
  dataPoints,
  onEvent: async ({ payload, onComplete, onError }): Promise<void> => {
    const { fields, airtopSdk } = await validatePayloadAndCreateSdk({
      fieldsSchema: FieldsValidationSchema,
      payload,
    })

    // Create a headless browser session
    const session = await airtopSdk.sessions.create()

    // Create a new window in the session and open the page
    const window = await airtopSdk.windows.create(session.data.id, {
      url: fields.pageUrl,
    })

    // Scrape the content of the window
    const content = await airtopSdk.windows.scrapeContent(
      session.data.id,
      window.data.windowId,
    )

    // Close the window and terminate the session
    await airtopSdk.windows.close(session.data.id, window.data.windowId)
    await airtopSdk.sessions.terminate(session.data.id)

    // Return the result
    await onComplete({
      data_points: {
        result: content.data.modelResponse.scrapedContent.text,
        mimeType: content.data.modelResponse.scrapedContent.contentType,
      },
    })
  },
}
