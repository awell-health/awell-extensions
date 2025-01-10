import { makeAPIClientMockFunc } from '../../__mocks__/client'
import { makeAPIClient } from '../../client'
import { getLetter as action } from './getLetter'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('../../client')

describe('Elation - Get letter', () => {
  const {
    extensionAction: sendCall,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(action)

  beforeAll(() => {
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation(makeAPIClientMockFunc)
  })

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
  })

  test('Should return the correct letter', async () => {
    await sendCall.onEvent({
      payload: {
        fields: {
          letterId: 123,
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

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        body: 'Diagnosis:\nLength of Time needed:\n\nAmbulatory Devices:\n[x] Wheelchair\n[] Cane\n[] Walker\n[] Walker with Wheels and Seat (Rollator)\n[] Power Wheel Chair',
        signedBy: '12323455',
      },
    })
  })
})
