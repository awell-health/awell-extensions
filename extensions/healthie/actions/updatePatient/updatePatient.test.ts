import { generateTestPayload } from '@/tests'
import { HealthieSdk } from '@awell-health/healthie-sdk'
import { updatePatient as actionInterface } from '../updatePatient'
import { TestHelpers } from '@awell-health/extensions-core'
import { FieldsValidationSchema } from './config'

jest.mock('@awell-health/healthie-sdk', () => ({
  HealthieSdk: jest.fn().mockImplementation(() => ({
    client: {
      mutation: jest.fn().mockResolvedValue({
        updateClient: {
          user: {
            id: 'test-patient',
          },
        },
      }),
    },
  })),
}))

const mockedHealthieSdk = jest.mocked(HealthieSdk)

describe('Healthie - updatePatient', () => {
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

  test('Field validation success', async () => {
    const fields = {
      id: 'test-patient',
      first_name: 'Test',
      last_name: 'Test',
      legal_name: undefined,
      email: 'test+lol11@test.com',
      phone_number: undefined,
      provider_id: undefined,
    }

    const result = FieldsValidationSchema.safeParse(fields)

    if (!result.success) {
      console.log(result.error.errors)
    }

    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data).toEqual({
        id: 'test-patient',
        first_name: 'Test',
        last_name: 'Test',
        email: 'test+lol11@test.com',
      })
    }
  })

  test('Field validation failure missing id', async () => {
    const fields = {
      first_name: 'Test',
      last_name: 'Test',
      legal_name: undefined,
      email: 'test+lol11@test.com',
      phone_number: undefined,
      provider_id: undefined,
    }

    const result = FieldsValidationSchema.safeParse(fields)

    expect(result.success).toBe(false)

    if (result?.error?.errors) {
      expect(result.error.errors[0]).toEqual({
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
        path: ['id'],
        message: 'Required',
      })
    }
  })

  test('Should update a patient', async () => {
    const payload = generateTestPayload({
      fields: {
        id: 'test-patient',
        first_name: 'Test',
        last_name: 'Test',
        legal_name: 'Official Test Name',
        email: 'test+lol142@test.com',
        phone_number: '+1234567890',
        provider_id: undefined,
      },
      settings: {
        apiUrl: 'https://staging-api.gethealthie.com/graphql',
        apiKey: 'apiKey',
      },
    })

    await action.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
    })

    expect(mockedHealthieSdk).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })

  test('Should update a patient with skipped email false when email is undefined', async () => {
    const payload = generateTestPayload({
      fields: {
        id: 'test-patient',
        first_name: 'Test',
        last_name: 'Test',
        legal_name: 'Official Test Name',
        email: undefined,
        phone_number: '+1234567890',
        provider_id: undefined,
        resend_welcome: true,
      },
      settings: {
        apiUrl: 'https://staging-api.gethealthie.com/graphql',
        apiKey: 'apiKey',
      },
    })
    await action.onEvent({
      payload,
      onComplete,
      onError,
      helpers,
    })

    expect(mockedHealthieSdk).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })
})
