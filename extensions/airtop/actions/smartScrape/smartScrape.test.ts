import { TestHelpers } from '@awell-health/extensions-core'
import { AirtopClient } from '@airtop/sdk'
import { smartScrape as action } from './smartScrape'

jest.mock('@airtop/sdk')

describe('Airtop - Smart Scrape', () => {
  let scrapeContentSpy: jest.SpyInstance

  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  describe('Happy path', () => {
    beforeEach(() => {
      const mockAirtopClient = {
        sessions: {
          create: jest.fn().mockResolvedValue({ data: { id: 'session-id' } }),
          terminate: jest
            .fn()
            .mockResolvedValue({ data: { id: 'session-id' } }),
        },
        windows: {
          create: jest
            .fn()
            .mockResolvedValue({ data: { windowId: 'window-id' } }),
          close: jest
            .fn()
            .mockResolvedValue({ data: { windowId: 'window-id' } }),
          scrapeContent: jest.fn().mockResolvedValue({
            data: {
              modelResponse: {
                scrapedContent: {
                  text: 'test content',
                  contentType: 'text/plain',
                },
              },
            },
          }),
        },
      }

      ;(
        AirtopClient as jest.MockedClass<typeof AirtopClient>
      ).mockImplementation(() => mockAirtopClient as any)

      scrapeContentSpy = mockAirtopClient.windows.scrapeContent
    })

    test('Should work', async () => {
      await extensionAction.onEvent({
        payload: {
          fields: {
            pageUrl: 'https://example.com',
          },
          settings: {
            apiKey: 'api-key',
          },
        } as any,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          result: 'test content',
          mimeType: 'text/plain',
        },
      })
    })
  })
})
