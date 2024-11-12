import { TestHelpers } from '@awell-health/extensions-core'

import { addVitals as action } from './addVitals'
import { ZodError } from 'zod'
import { vitalsExample } from '../../__mocks__/constants'

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
  })

  test('Should call onComplete when successful', async () => {
    await addVitals.onEvent({
      payload: {
        fields: vitalsExample,
        settings,
      } as any,
      onComplete,
      onError,
      helpers,
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call onError when patientId is missing', async () => {
    const resp = addVitals.onEvent({
      payload: {
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
    })

    await expect(resp).rejects.toThrow(ZodError)
    expect(onComplete).not.toHaveBeenCalled()
  })

  test('Should call onError when field is missing ', async () => {
    const resp = addVitals.onEvent({
      payload: {
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
    })

    await expect(resp).rejects.toThrow(ZodError)
    expect(onComplete).not.toHaveBeenCalled()
  })

  test('Should call onError when type is incorrect', async () => {
    const resp = addVitals.onEvent({
      payload: {
        fields: {
          ...vitalsExample,
          wc: { value: 'some value' },
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
