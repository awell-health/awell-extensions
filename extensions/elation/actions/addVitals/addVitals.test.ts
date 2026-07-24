import { TestHelpers } from '@awell-health/extensions-core'

import { addVitals as action } from './addVitals'
import { vitalsExample } from '../../__mocks__/constants'
import { testPayload } from '../../../../tests'

jest.mock('../../client')

describe('Elation - Add Vitals', () => {
  const {
    extensionAction: addVitals,
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
    await addVitals.onEvent({
      payload: {
        ...testPayload,
        fields: vitalsExample,
        settings,
      } as any,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call onError when patientId is missing', async () => {
    await addVitals.onEvent({
      payload: {
        ...testPayload,
        fields: {
          practiceId: 67890,
          visitNoteId: 11111,
          bmi: 25.5,
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

  test('Should call onError when field is missing', async () => {
    await addVitals.onEvent({
      payload: {
        ...testPayload,
        fields: {
          patientId: 123,
          visitNoteId: 11111,
          bmi: 25.5,
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

  test('Should call onError when type is incorrect', async () => {
    await addVitals.onEvent({
      payload: {
        ...testPayload,
        fields: {
          ...vitalsExample,
          wc: { value: 'some value' },
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
