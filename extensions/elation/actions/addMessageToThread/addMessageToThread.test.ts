import { TestHelpers } from '@awell-health/extensions-core'

import { addMessageToThread as action } from './addMessageToThread'
import { ZodError } from 'zod'
import { makeAPIClient } from '../../client';

jest.mock('../../client')

const mockAddMessageToThread = jest.fn().mockResolvedValue({ id: '1' })
;(makeAPIClient as jest.Mock).mockImplementation(() => ({
  addMessageToThread: mockAddMessageToThread,
}))

describe('Elation - Add message to thread', () => {
  const {
    extensionAction: addMessageToThread,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(action)

  const messagExample = {
    senderId: 12345,
    threadId: 999,
    messageBody: "Hello world"
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

  test('Should call onComplete when successful', async () => {
    await addMessageToThread.onEvent({
      payload: {
        fields: messagExample,
        settings,
      } as any,
      onComplete,
      onError,
      helpers,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        messageId: '1',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

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
    })

    await expect(resp).rejects.toThrow(ZodError)
    expect(onComplete).not.toHaveBeenCalled()
  })
})
