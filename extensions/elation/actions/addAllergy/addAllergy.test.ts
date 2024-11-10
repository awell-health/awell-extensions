import { TestHelpers } from '@awell-health/extensions-core'

import { addAllergy as action } from './addAllergy'
import { ZodError } from 'zod'
import { allergyExample } from '../../__mocks__/constants'

jest.mock('../../client')

describe('Elation - Add allergy', () => {
  const {
    extensionAction: addAllergy,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(action)

  const settings = {
    client_id: 'clientId',
    client_secret: 'clientSecret',
    username: 'username',
    password: 'password',
    auth_url: 'authUrl',
    base_url: 'baseUrl',
  }

  beforeEach(() => {
    clearMocks()
  })

  test('Should call onComplete when successful', async () => {
    await addAllergy.onEvent({
      payload: {
        fields: allergyExample,
        settings,
      } as any,
      onComplete,
      onError,
      helpers,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        allergyId: '1',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call onError when required fields are missing', async () => {
    const resp = addAllergy.onEvent({
      payload: {
        fields: {
          patientId: undefined,
          name: undefined,
        },
        settings,
      } as any,
      onComplete,
      onError,
      helpers,
    })

    await expect(resp).rejects.toThrow(ZodError)
    expect(onComplete).not.toHaveBeenCalled()
  })

  test('Should call onError when no patientId is provided and name is invalid format', async () => {
    const resp = addAllergy.onEvent({
      payload: {
        fields: {
          name: {
            value: 'Penicillin',
          },
        },
        settings,
      } as any,
      onComplete,
      onError,
      helpers,
    })

    await expect(resp).rejects.toThrow(ZodError)
    expect(onComplete).not.toHaveBeenCalled()
  })
})
