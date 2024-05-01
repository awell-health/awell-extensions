import { generateTestPayload } from '../../../../../src/tests'
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
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await getPatientByIdentifier.onActivityCreated(
      generateTestPayload({
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
      onError
    )

    expect(mockFn).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        patientAlreadyExists: 'true',
        patientId: 'F-Pkm3fFMYW-F2o7lSCgU',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })
})
