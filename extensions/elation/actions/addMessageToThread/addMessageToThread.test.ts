import { TestHelpers } from '@awell-health/extensions-core'

import { addMessageToThread as action } from './addMessageToThread'
import { makeAPIClient } from '../../client'
import { testPayload } from '../../../../tests'

jest.mock('../../client')

describe('Elation - Add message to thread', () => {
  const {
    extensionAction: addMessageToThread,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(action)

  const mockAddMessageToThread = jest.fn()

  const messagExample = {
    senderId: 12345,
    threadId: 999,
    messageBody: 'Hello world',
  }

  const settings = {
    auth_url: 'authurl',
    base_url: 'baseurl',
    client_id: 'client_id',
    client_secret: 'client_secret',
    username: 'username',
    password: 'password',
  }

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
  })

  describe('Validation', () => {
    test('Should call onError when required fields are missing', async () => {
      await addMessageToThread.onEvent({
        payload: {
          ...testPayload,
          fields: {
            ...messagExample,
            messageBody: undefined,
          },
          settings,
        } as any,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(onError).toHaveBeenCalledWith({
        events: [
          expect.objectContaining({
            error: {
              category: 'SERVER_ERROR',
              message: expect.any(String),
            },
          }),
        ],
      })
      expect(onComplete).not.toHaveBeenCalled()
      expect(mockAddMessageToThread).not.toHaveBeenCalled()
    })

    test('Should call onError when threadId has an invalid format', async () => {
      await addMessageToThread.onEvent({
        payload: {
          ...testPayload,
          fields: {
            ...messagExample,
            threadId: 'some text',
          },
          settings,
        } as any,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(onError).toHaveBeenCalledWith({
        events: [
          expect.objectContaining({
            error: {
              category: 'SERVER_ERROR',
              message: expect.any(String),
            },
          }),
        ],
      })
      expect(onComplete).not.toHaveBeenCalled()
      expect(mockAddMessageToThread).not.toHaveBeenCalled()
    })
  })

  describe('Successful cases', () => {
    beforeAll(() => {
      const mockAPIClient = makeAPIClient as jest.Mock
      mockAPIClient.mockImplementation(() => ({
        addMessageToThread: mockAddMessageToThread.mockResolvedValue({
          id: 1,
        }),
      }))
    })

    test('Should call onComplete when successful', async () => {
      await addMessageToThread.onEvent({
        payload: {
          ...testPayload,
          fields: messagExample,
          settings,
        } as any,
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          messageId: '1',
        },
      })
      expect(onError).not.toHaveBeenCalled()
    })
  })
})
