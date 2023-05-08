import { getPatient } from '../getPatient'
import { type ActivityEvent } from '../../../../lib/types/ActivityEvent'
import { patientExample } from '../../__mocks__/constants'
import { NoCache } from '../../../../services/cache/cache'

jest.mock('../../client')

describe('Simple get patient action', () => {
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
    await getPatient.onActivityCreated(
      {
        fields: {
          patientId: '1',
        },
        settings,
      } as any,
      onComplete,
      jest.fn(),
      { authCacheService: new NoCache() }
    )
    expect(onComplete).toHaveBeenCalled()
    expect(onComplete).toBeCalledWith({
      data_points: {
        ...patientExample,
        mobile_phone: 'undefined',
        primary_physician: String(patientExample.primary_physician),
        caregiver_practice: String(patientExample.caregiver_practice),
      },
    })
  })

  test('Should provide good error messaging', async () => {
    const onError = jest
      .fn()
      .mockImplementation((obj: { events: ActivityEvent[] }) => {
        return obj.events[0].error?.message
      })
    await getPatient.onActivityCreated(
      {
        fields: {
          patientId: '',
        },
        settings,
      } as any,
      onComplete,
      onError,
      { authCacheService: new NoCache() }
    )
    expect(onError).toHaveBeenCalled()
    expect(onError).toHaveReturnedWith(
      'Validation error: Requires a valid ID (number)'
    )
  })
})
