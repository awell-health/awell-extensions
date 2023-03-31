import { getPatient } from '..'
import { patientExample } from '../../types/patient'
import { ElationAPIClient } from '../../client'
import { type ActivityEvent } from '../../../../lib/types/ActivityEvent'

describe('Simple get patient action', () => {
  const onComplete = jest.fn()
  const settings = {
    client_id: 'asdf',
    client_secret: 'asdf',
    username: 'asdf',
    password: 'asdf',
  }
  jest
    .spyOn(ElationAPIClient.prototype, 'getPatient')
    .mockImplementation(async (id) => {
      return patientExample
    })
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
        first_name: patientExample.first_name,
        last_name: patientExample.last_name,
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
