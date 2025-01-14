import { makeAPIClient } from '../../client'
import { findUser as action } from './findUser'
import { TestHelpers } from '@awell-health/extensions-core'
import {
  usersMockResponsePageOne,
  usersMockResponsePageTwo,
} from './__testdata__/users.mock'

jest.mock('../../client', () => ({
  makeAPIClient: jest.fn().mockImplementation(() => ({
    /**
     * Mock the getAllUsers method to return different responses based on the offset
     * This is to simulate the pagination of the users
     */
    getAllUsers: jest.fn().mockImplementation(({ offset }) => {
      if (offset === 0) {
        return usersMockResponsePageOne
      }

      return usersMockResponsePageTwo
    }),
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

  describe('When the user is found on the first page', () => {
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
  })

  describe('When the user is found on the second page', () => {
    test('Should return the correct user id', async () => {
      await extensionAction.onEvent({
        payload: {
          fields: {
            userEmail: 'awell.doe@example.com',
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
          userId: '4',
        },
      })
    })
  })

  describe('When the user is not found', () => {
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
})
