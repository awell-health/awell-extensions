import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { sendEmailWithSingleSendApi } from '.'
import { Client } from '@hubspot/api-client'

jest.mock('@hubspot/api-client', () => {
  return {
    Client: jest.fn().mockImplementation(() => {
      return {
        marketing: {
          transactional: {
            singleSendApi: {
              sendEmail: jest.fn().mockResolvedValue({
                statusId: '99999',
              }),
            },
          },
        },
      }
    }),
  }
})

const mockedHubSpotSdk = jest.mocked(Client)

describe('HubSpot - Send email with Single Send API', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(sendEmailWithSingleSendApi)

  beforeEach(() => {
    clearMocks()
  })

  test('Should work', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          emailId: 'emailId',
          from: 'from',
          to: 'to',
          contactProperties: JSON.stringify({
            firstname: 'Nick',
          }),
          customProperties: JSON.stringify({
            productName: 'Awell',
          }),
        },
        settings: {
          accessToken: 'accessToken',
        },
      }),
      onComplete,
      onError,
      helpers,
    })

    expect(mockedHubSpotSdk).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })
})
