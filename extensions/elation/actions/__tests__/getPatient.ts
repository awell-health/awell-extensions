import { getPatient } from '..'
import { type ActivityEvent } from '../../../../lib/types/ActivityEvent'

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
          patientId: '141372212838401',
        },
        settings,
      } as any,
      onComplete,
      jest.fn()
    )
    expect(onComplete).toHaveBeenCalled()
    expect(onComplete).toBeCalledWith({
      data_points: {
        first_name: 'First',
        last_name: 'Last',
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
      onError
    )
    expect(onError).toHaveBeenCalled()
    expect(onError).toHaveReturnedWith(
      'Validation error: Requires a valid ID (number)'
    )
  })
})
