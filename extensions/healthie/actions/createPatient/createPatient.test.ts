import { generateTestPayload } from '../../../../src/tests'
import { HealthieSdk } from '@extensions/healthie/lib/sdk/genql'
import { createPatient as actionInterface } from '../createPatient'
import { TestHelpers } from '@awell-health/extensions-core'
import { FieldsValidationSchema } from './config'

jest.mock('@extensions/healthie/lib/sdk/genql', () => ({
  HealthieSdk: jest.fn().mockImplementation(() => ({
    client: {
      mutation: jest.fn().mockResolvedValue({
        createClient: {
          user: {
            id: 'patient-1',
            set_password_link:
              'https://securestaging.gethealthie.com/set_initial_password?signup_token=MOCK_TOKEN',
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

  test('Field validation', async () => {
    const fields = {
      first_name: 'Test',
      last_name: 'Test',
      legal_name: undefined,
      email: 'test+lol11@test.com',
      phone_number: undefined,
      provider_id: undefined,
      skipped_email: undefined,
      send_invite: false,
    }

    const result = FieldsValidationSchema.safeParse(fields)

    if (!result.success) {
      console.log(result.error.errors)
    }

    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data).toEqual({
        first_name: 'Test',
        last_name: 'Test',
        email: 'test+lol11@test.com',
        send_invite: false,
      })
    }
  })

  test('Should create a new patient', async () => {
    await action.onEvent({
      payload: generateTestPayload({
        fields: {
          first_name: 'Test',
          last_name: 'Test',
          legal_name: 'Official Test Name',
          email: 'test+lol142@test.com',
          phone_number: '+1234567890',
          provider_id: undefined,
          skipped_email: undefined,
          send_invite: false,
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
