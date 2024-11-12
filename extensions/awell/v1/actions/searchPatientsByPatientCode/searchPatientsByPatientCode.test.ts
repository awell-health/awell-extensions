import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import AwellSdk from '../../sdk/awellSdk'
import { searchPatientsByPatientCode } from './searchPatientsByPatientCode'

jest.mock('../../sdk/awellSdk')

const mockFn = jest
  .spyOn(AwellSdk.prototype, 'searchPatientsByPatientCode')
  .mockImplementationOnce(
    jest.fn().mockResolvedValue([
      {
        id: 'patient-id-1',
        profile: {
          patient_code: '123',
        },
      },
      {
        id: 'patient-id-2',
        profile: {
          patient_code: '123',
        },
      },
    ])
  )

describe('Search patients by patient code', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(searchPatientsByPatientCode)

  beforeEach(() => {
    clearMocks()
  })

  test('Should call the onComplete callback', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        patient: {
          id: 'patient-id-1',
          profile: {
            patient_code: '123',
          },
        },
        fields: {
          pathwayDefinitionId: 'a-pathway-definition-id',
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
    })

    expect(mockFn).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        patientAlreadyExists: 'true',
        numberOfPatientsFound: '1',
        awellPatientIds: 'patient-id-2',
      },
      events: expect.any(Array),
    })
    expect(onError).not.toHaveBeenCalled()
  })
})
