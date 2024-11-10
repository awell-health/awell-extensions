import { createAllergy } from '../createAllergy'
import { allergyExample } from '../../__mocks__/constants'

jest.mock('../../client')

describe('Create Allergy', () => {
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

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call onComplete when successful', async () => {
    const { patientId, name, startDate, reaction, severity } = allergyExample
    await createAllergy.onActivityCreated!(
      {
        fields: {
          patientId,
          name,
          startDate,
          reaction,
          severity,
        },
        settings,
      } as any,
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        allergyId: '1',
      },
    })
    // expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call onError when api call fails', async () => {
    const errorMessage =
      'Validation error: Requires a valid ID (number) at "patient"; Expected string, received object at "name"'
    // @ts-ignore
    require('../../client').makeAPIClient.mockReturnValue({
      createAllergy: jest.fn(() => Promise.reject(new Error(errorMessage))),
    })

    await createAllergy.onActivityCreated!(
      {
        fields: {
          patientId: {
            value: 123,
          },
          name: {
            value: 'Penicillin',
          },
        },
        settings,
      } as any,
      onComplete,
      onError
    )
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledTimes(1)
    // @ts-ignore
    expect(onError.mock.calls[0][0].events[0].error.message).toBe(errorMessage)
  })

  test('Should call onError when no patientId is provided', async () => {
    await createAllergy.onActivityCreated!(
      {
        fields: {
          name: {
            value: 'Penicillin',
          },
        },
        settings,
      } as any,
      onComplete,
      onError
    )
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledTimes(1)
    // @ts-ignore
    expect(onError.mock.calls[0][0].events[0].error.message).toBe(
      'Validation error: Requires a valid ID (number) at "patient"; Expected string, received object at "name"'
    )
  })
})
