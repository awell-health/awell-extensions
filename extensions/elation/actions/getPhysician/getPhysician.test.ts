import { getPhysician } from '.'
import { physicianResponseExample } from '../../__mocks__/constants'
import { makeAPIClientMockFunc } from '../../__mocks__/client'
import { makeAPIClient } from '../../client'
import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'

jest.mock('../../client')

describe('Elation - Get physician', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(getPhysician)
  const settings = {
    client_id: 'clientId',
    client_secret: 'clientSecret',
    username: 'username',
    password: 'password',
    auth_url: 'authUrl',
    base_url: 'baseUrl',
  }

  beforeAll(() => {
    const mockAPIClient = makeAPIClient as jest.Mock
    mockAPIClient.mockImplementation(makeAPIClientMockFunc)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should return the correct physician', async () => {
    await getPhysician.onEvent!({
      payload: generateTestPayload({
        fields: {
          physicianId: 1,
        },
        settings,
      } as any),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        physicianFirstName: physicianResponseExample.first_name,
        physicianLastName: physicianResponseExample.last_name,
        physicianCredentials: physicianResponseExample.credentials,
        physicianEmail: physicianResponseExample.email,
        physicianNPI: physicianResponseExample.npi,
        physicianUserId: String(physicianResponseExample.user_id),
        caregiverPracticeId: String(physicianResponseExample.practice),
      },
    })
  })
})
