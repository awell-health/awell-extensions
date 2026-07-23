import { TestHelpers } from '@awell-health/extensions-core'

import { addHistory as action } from './addHistory'
import { historyExample } from '../../__mocks__/constants'
import { testPayload } from '../../../../tests'

jest.mock('../../client')

describe('Elation - Add History', () => {
  const {
    extensionAction: addHistory,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(action)

  const settings = {
    client_id: 'clientId',
    client_secret: 'clientSecret',
    username: 'username',
    password: 'password',
    auth_url: 'authUrl',
    base_url: 'baseUrl',
  }

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
  })

  test('Should call onComplete when successful', async () => {
    await addHistory.onEvent({
      payload: {
        ...testPayload,
        fields: historyExample,
        settings,
      } as any,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call onError when patientId is missing', async () => {
    await addHistory.onEvent({
      payload: {
        ...testPayload,
        fields: {
          type: 'Past',
          text: 'some txt',
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
  })

  test('Should call onError when field is missing', async () => {
    await addHistory.onEvent({
      payload: {
        ...testPayload,
        fields: {
          patientId: 123,
          type: 'History',
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
  })

  test('Should call onError when type is incorrect', async () => {
    await addHistory.onEvent({
      payload: {
        ...testPayload,
        fields: {
          patientId: 123,
          type: 'something',
          text: 'some txt',
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
  })

  test('Should call onError when text is incorrect type', async () => {
    await addHistory.onEvent({
      payload: {
        ...testPayload,
        fields: {
          patientId: 123,
          type: 'history',
          text: { value: 'some txt' },
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
  })
})
