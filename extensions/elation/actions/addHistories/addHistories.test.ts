import { TestHelpers } from '@awell-health/extensions-core'

import { addHistories as action } from './addHistories'
import { ZodError } from 'zod'
import { historyExample } from '../../__mocks__/constants'

jest.mock('../../client')

describe('Elation - Add Histories', () => {
  const {
    extensionAction: addHistories,
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
    await addHistories.onEvent({
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
    const resp = addHistories.onEvent({
      payload: {
        fields: {
          medical: 'history',
          surgical: 'history',
          family: 'history',
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
