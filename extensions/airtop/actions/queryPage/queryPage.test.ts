import { TestHelpers } from '@awell-health/extensions-core'
import { AirtopClient } from '@airtop/sdk'
import { queryPage as action } from './queryPage'
import { testPayload } from '../../../../tests'

jest.mock('@airtop/sdk')

describe('Airtop - Query page', () => {
  let pageQuerySpy: jest.SpyInstance

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
          pageQuery: jest.fn().mockResolvedValue({
            data: {
              modelResponse: 'test content',
            },
          }),
        },
      }

      ;(
        AirtopClient as jest.MockedClass<typeof AirtopClient>
      ).mockImplementation(() => mockAirtopClient as any)

      pageQuerySpy = mockAirtopClient.windows.pageQuery
    })

    test('Should work', async () => {
      await extensionAction.onEvent({
        payload: {
          ...testPayload,
          fields: {
            pageUrl: 'https://example.com',
            prompt: 'test prompt',
            jsonSchema: undefined,
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
          resultJson: undefined,
        },
      })
    })
  })
})
