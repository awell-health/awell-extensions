import { findPhysician } from '../findPhysician'
import { physicianResponseExample } from '../../__mocks__/constants'
import { makeAPIClientMockFunc, mockClientReturn } from '../../__mocks__/client'
import { makeAPIClient } from '../../client'

jest.mock('../../client')

describe('Simple find physician action', () => {
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

  test('Should return with correct data_points', async () => {
    await findPhysician.onActivityCreated!(
      {
        fields: {
          firstName: undefined,
          lastName: undefined,
          npi: undefined,
        },
        settings,
      } as any,
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        physicianId: String(physicianResponseExample.id),
      },
    })
  })

  test('Should return with error when multiple physicians', async () => {
    mockClientReturn.findPhysicians.mockReturnValueOnce({
      count: 2,
      next: null,
      previous: null,
      results: [physicianResponseExample, physicianResponseExample],
    })
    await findPhysician.onActivityCreated!(
      {
        fields: { firstName: undefined, lastName: undefined, npi: undefined },
        settings,
      } as any,
      onComplete,
      onError
    )
    expect(onError).toHaveBeenCalledWith({
      events: [
        expect.objectContaining({
          text: {
            en: 'Find Physicians returned 2 results, but the number of results must equal exactly 1.',
          },
        }),
      ],
    })
  })
})
