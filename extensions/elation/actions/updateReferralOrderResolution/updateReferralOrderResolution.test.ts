import { makeAPIClientMockFunc } from '../../__mocks__/client'
import { makeAPIClient } from '../../client'
import { updateReferralOrderResolution as action } from './updateReferralOrderResolution'
import { TestHelpers } from '@awell-health/extensions-core'
import { createAxiosError } from '../../../../tests'

jest.mock('../../client', () => ({
  makeAPIClient: jest.fn(),
}))

describe('Elation - Update referral order resolution', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  const mockUpdateReferralOrder = jest.fn()

  beforeAll(() => {
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation(makeAPIClientMockFunc)
  })

  beforeAll(() => {
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation(() => ({
      updateReferralOrder: mockUpdateReferralOrder,
    }))
  })

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
  })

  describe('Exceptions', () => {
    describe('When the referral order does not exist', () => {
      beforeEach(() => {
        mockUpdateReferralOrder.mockRejectedValue(
          createAxiosError(
            404,
            'Not Found',
            JSON.stringify({
              detail: 'No ReferralOrder matches the given query.',
            }),
          ),
        )
      })

      test('Should return an error', async () => {
        await extensionAction.onEvent({
          payload: {
            fields: {
              referralOrderId: 142685415604249,
              resolutionState: 'fulfilled',
            },
            settings: {
              client_id: 'clientId',
              client_secret: 'clientSecret',
              username: 'username',
              password: 'password',
              auth_url: 'authUrl',
              base_url: 'baseUrl',
            },
          } as any,
          onComplete,
          onError,
          helpers,
        })

        expect(onError).toHaveBeenCalledWith({
          events: [
            {
              date: expect.any(String),
              text: {
                en: 'The referral order (142685415604249) does not exist.',
              },
            },
          ],
        })
      })
    })
  })

  describe('Happy path', () => {
    beforeEach(() => {
      mockUpdateReferralOrder.mockResolvedValue({})
    })

    test('Should update the referral order resolution', async () => {
      await extensionAction.onEvent({
        payload: {
          fields: {
            referralOrderId: 142685415604249,
            resolutionState: 'fulfilled',
          },
          settings: {
            client_id: 'clientId',
            client_secret: 'clientSecret',
            username: 'username',
            password: 'password',
            auth_url: 'authUrl',
            base_url: 'baseUrl',
          },
        } as any,
        onComplete,
        onError,
        helpers,
      })

      expect(onError).not.toHaveBeenCalled()
      expect(onComplete).toHaveBeenCalled()
    })
  })
})
