import { makeAPIClient } from '../../client'
import { findUser as action } from './findUser'
import { TestHelpers } from '@awell-health/extensions-core'
import { usersMockResponse } from './__testdata__/users.mock'

jest.mock('../../client', () => ({
  makeAPIClient: jest.fn().mockImplementation(() => ({
    getAllUsers: jest.fn().mockResolvedValue(usersMockResponse),
  })),
}))

const mockedSdk = jest.mocked(makeAPIClient)

describe('Elation - Find user', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

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

  test('Should return the correct user id', async () => {
    await extensionAction.onEvent({
      payload: {
        fields: {
          userEmail: 'melanie.smith@example.com',
        },
        settings,
      } as any,
      onComplete,
      onError,
      helpers,
    })

    expect(mockedSdk).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        userId: '2',
      },
    })
  })

  test('Should return an error if the user is not found', async () => {
    await extensionAction.onEvent({
      payload: {
        fields: {
          userEmail: 'helloworld@example.com',
        },
        settings,
      } as any,
      onComplete,
      onError,
      helpers,
    })

    expect(mockedSdk).toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith({
      events: [
        {
          date: expect.any(String),
          text: {
            en: 'No user found with the provided email',
          },
        },
      ],
    })
  })
})
