import { TestHelpers } from '@awell-health/extensions-core'

import { addHistory as action } from './addHistory'
import { ZodError } from 'zod'
import { historyExample } from '../../__mocks__/constants'

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
  })

  test('Should call onComplete when successful', async () => {
    await addHistory.onEvent({
      payload: {
        fields: historyExample,
        settings,
      } as any,
      onComplete,
      onError,
      helpers,
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call onError when patientId is missing', async () => {
    const resp = addHistory.onEvent({
      payload: {
        fields: {
          type: 'Past',
          text: 'some txt',
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

  test('Should call onError when field is missing ', async () => {
    const resp = addHistory.onEvent({
      payload: {
        fields: {
          patientId: 123,
          type: 'History',
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

  test('Should call onError when type is incorrect', async () => {
    const resp = addHistory.onEvent({
      payload: {
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
    })

    await expect(resp).rejects.toThrow(ZodError)
    expect(onComplete).not.toHaveBeenCalled()
  })

  test('Should call onError when text is incorrect type', async () => {
    const resp = addHistory.onEvent({
      payload: {
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
    })

    await expect(resp).rejects.toThrow(ZodError)
    expect(onComplete).not.toHaveBeenCalled()
  })
})
