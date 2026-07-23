import { TestHelpers } from '@awell-health/extensions-core'

import { addAllergy as action } from './addAllergy'
import { allergyExample } from '../../__mocks__/constants'
import { testPayload } from '../../../../tests'

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
    jest.clearAllMocks()
  })

  test('Should call onComplete when successful', async () => {
    await addAllergy.onEvent({
      payload: {
        ...testPayload,
        fields: allergyExample,
        settings,
      } as any,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        allergyId: '1',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call onError when required fields are missing', async () => {
    await addAllergy.onEvent({
      payload: {
        ...testPayload,
        fields: {
          patientId: undefined,
          name: undefined,
        },
        settings,
      } as any,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onError).toHaveBeenCalledWith({
      events: [
        expect.objectContaining({
          error: {
            category: 'SERVER_ERROR',
            message: expect.any(String),
          },
        }),
      ],
    })
    expect(onComplete).not.toHaveBeenCalled()
  })

  test('Should call onError when no patientId is provided and name is invalid format', async () => {
    await addAllergy.onEvent({
      payload: {
        ...testPayload,
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
      attempt: 1,
    })

    expect(onError).toHaveBeenCalledWith({
      events: [
        expect.objectContaining({
          error: {
            category: 'SERVER_ERROR',
            message: expect.any(String),
          },
        }),
      ],
    })
    expect(onComplete).not.toHaveBeenCalled()
  })
})
