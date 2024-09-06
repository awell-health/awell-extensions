import { getPhysician } from '.'
import { physicianResponseExample } from '../../__mocks__/constants'
import { makeAPIClientMockFunc } from '../../__mocks__/client'
import { makeAPIClient } from '../../client'

jest.mock('../../client')

describe('Elation - Get physician', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()
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
    await getPhysician.onActivityCreated!(
      {
        fields: {
          physicianId: 1,
        },
        settings,
      } as any,
      onComplete,
      onError
    )
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
