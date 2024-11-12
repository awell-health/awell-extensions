import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import AwellSdk from '../../sdk/awellSdk'
import { getPatientByIdentifier } from './getPatientByIdentifier'

jest.mock('../../sdk/awellSdk')

const mockFn = jest
  .spyOn(AwellSdk.prototype, 'getPatientByIdentifier')
  .mockImplementationOnce(
    jest.fn().mockResolvedValue({
      id: 'F-Pkm3fFMYW-F2o7lSCgU',
    })
  )

describe('Get patient by identifier', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(getPatientByIdentifier)

  beforeEach(() => {
    clearMocks()
  })

  test('Should call the onComplete callback', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          system: 'https://www.awellhealth.com/',
          value: '123',
        },
        settings: {
          apiUrl: 'an-api-url',
          apiKey: 'an-api-key',
        },
      }),
      onComplete,
      onError,
      helpers,
    })

    expect(mockFn).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        patientAlreadyExists: 'true',
        patientId: 'F-Pkm3fFMYW-F2o7lSCgU',
      },
      events: expect.any(Array),
    })
    expect(onError).not.toHaveBeenCalled()
  })
})
