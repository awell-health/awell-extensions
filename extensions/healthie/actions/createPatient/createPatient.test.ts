import { generateTestPayload } from '../../../../src/tests'
import { HealthieSdk } from '@extensions/healthie/lib/sdk/genql'
import { createPatient as actionInterface } from '../createPatient'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('@extensions/healthie/lib/sdk/genql', () => ({
  HealthieSdk: jest.fn().mockImplementation(() => ({
    client: {
      mutation: jest.fn().mockResolvedValue({
        createClient: {
          user: {
            id: 'patient-1',
          },
        },
      }),
    },
  })),
}))

const mockedHealthieSdk = jest.mocked(HealthieSdk)

describe('Healthie - createPatient', () => {
  const {
    extensionAction: action,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(actionInterface)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should create a new patient', async () => {
    await action.onEvent({
      payload: generateTestPayload({
        fields: {
          first_name: 'Test',
          last_name: 'Test',
          legal_name: undefined,
          email: 'test14@test.com',
          phone_number: undefined,
          provider_id: undefined,
          skipped_email: undefined,
        },
        settings: {
          apiUrl: 'https://staging-api.gethealthie.com/graphql',
          apiKey: 'apiKey',
        },
      }),
      onComplete,
      onError,
      helpers,
    })

    expect(mockedHealthieSdk).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        healthiePatientId: 'patient-1',
      },
    })
  })
})
