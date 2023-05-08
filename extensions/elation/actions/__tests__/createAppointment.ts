import { appointmentExample } from '../../__mocks__/constants'
import { createAppointment } from '../createAppointment'
import { NoCache } from '../../../../services/cache/cache'

jest.mock('../../client')

describe('Simple create appointment action', () => {
  const onComplete = jest.fn()
  const settings = {
    client_id: 'clientId',
    client_secret: 'clientSecret',
    username: 'username',
    password: 'password',
    auth_url: 'authUrl',
    base_url: 'baseUrl',
  }

  beforeEach(() => {
    onComplete.mockClear()
  })

  test('Should return with correct data_points', async () => {
    await createAppointment.onActivityCreated(
      {
        fields: {
          ...appointmentExample,
        },
        settings,
      } as any,
      onComplete,
      jest.fn(),
      { authCacheService: new NoCache() }
    )
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        appointmentId: '1',
      },
    })
  })
})
