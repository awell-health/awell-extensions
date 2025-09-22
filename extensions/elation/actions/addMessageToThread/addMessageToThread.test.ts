import { TestHelpers } from '@awell-health/extensions-core'

import { addMessageToThread as action } from './addMessageToThread'
import { ZodError } from 'zod'
import { makeAPIClient } from '../../client'

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
  })

  describe('Validation', () => {
    test('Should call onError when required fields are missing', async () => {
      const resp = addMessageToThread.onEvent({
        payload: {
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

      await expect(resp).rejects.toThrow(ZodError)
      expect(onComplete).not.toHaveBeenCalled()
    })

    test('Should call onError when no threadId is invalid format', async () => {
      const resp = addMessageToThread.onEvent({
        payload: {
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

      await expect(resp).rejects.toThrow(ZodError)
      expect(onComplete).not.toHaveBeenCalled()
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
