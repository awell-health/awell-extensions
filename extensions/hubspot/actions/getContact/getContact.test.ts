import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { getcontact } from '.'
import { Client } from '@hubspot/api-client'

jest.mock('@hubspot/api-client', () => {
  return {
    Client: jest.fn().mockImplementation(() => {
      return {
        crm: {
          contacts: {
            basicApi: {
              getById: jest.fn().mockResolvedValue({
                id: '57898932622',
                properties: {
                  firstname: 'John',
                  lastname: 'Doe',
                  email: 'john.doe@example.com',
                },
              }),
            },
          },
        },
      }
    }),
  }
})

const mockedHubspotSdk = jest.mocked(Client)

describe('HubSpot - Get contact', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(getcontact)

  beforeEach(() => {
    clearMocks()
  })

  test('Should work', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          contactId: '57898932622',
        },
        settings: {
          accessToken: 'accessToken',
        },
      }),
      onComplete,
      onError,
      helpers,
    })

    expect(mockedHubspotSdk).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      },
    })
  })
})
