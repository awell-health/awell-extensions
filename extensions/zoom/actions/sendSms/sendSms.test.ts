import { TestHelpers } from '@awell-health/extensions-core'
import { ZoomApiClient } from '../../api/client'
import { sendSms as action } from './sendSms'

jest.mock('../../api/client', () => ({
  ZoomApiClient: jest.fn().mockImplementation(() => ({
    sendSms: jest.fn().mockResolvedValue({
      data: [
        {
          contact_center_number: '+12090000000',
          consumer_number: '+12090001111',
          message_id: 'IQ-dhfaoufosadfb',
          success: true,
          description: 'The consumer number you have messaged has not opted in',
        },
      ],
    }),
  })),
}))

const mockedSdk = jest.mocked(ZoomApiClient)

describe('Zoom - Send SMS', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  test('Should work', async () => {
    await extensionAction.onEvent({
      payload: {
        fields: {
          contactCenterNumber: '+12090000000',
          to: '+12090001111',
          body: 'Hello, world!',
        },
        settings: {
          accountId: 'account-id',
          clientId: 'client-id',
          clientSecret: 'client-secret',
        },
      } as any,
      onComplete,
      onError,
      helpers,
    })

    expect(mockedSdk).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })
})
