import { generateTestPayload } from '@/tests'
import { HealthieSdk } from '@awell-health/healthie-sdk'
import { createPatient as actionInterface } from '../createPatient'
import { TestHelpers } from '@awell-health/extensions-core'
import { FieldsValidationSchema } from './config'

jest.mock('@awell-health/healthie-sdk', () => ({
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
    clearMocks()
  })

  test('Field validation', async () => {
    const fields = {
      first_name: 'Test',
      last_name: 'Test',
      legal_name: undefined,
      email: 'test+lol11@test.com',
      phone_number: undefined,
      provider_id: undefined,
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

  test('Should create a new patient with skipped email false when email is empty string', async () => {
    await action.onEvent({
      payload: generateTestPayload({
        fields: {
          first_name: 'Test',
          last_name: 'Test',
          legal_name: 'Official Test Name',
          email: '',
          phone_number: '+1234567890',
          provider_id: undefined,
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

  test('Should create a new patient with skipped email false when email is undefined', async () => {
    await action.onEvent({
      payload: generateTestPayload({
        fields: {
          first_name: 'Test',
          last_name: 'Test',
          legal_name: 'Official Test Name',
          email: undefined,
          phone_number: '+1234567890',
          provider_id: undefined,
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
