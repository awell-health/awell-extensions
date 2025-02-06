import { TestHelpers } from '@awell-health/extensions-core'

import { getPatientVitals as action } from './getPatientVitals'
import { ZodError } from 'zod'

jest.mock('../../client')

describe('Elation - Get Patient Vitals', () => {
  const {
    extensionAction: getPatientVitals,
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

  const patientDetails = {
    patientId: 123,
  }

  beforeEach(() => {
    clearMocks()
  })

  test('Should call onComplete when successful', async () => {
    await getPatientVitals.onEvent({
      payload: {
        fields: patientDetails,
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
    const resp = getPatientVitals.onEvent({
      payload: {
        fields: {},
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
