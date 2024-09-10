import { TestHelpers } from '@awell-health/extensions-core'
import { ZodError } from 'zod'
import { generateTestPayload } from '@/tests'
import { updatePatient } from './updatePatient'

jest.mock('../../sdk/awellSdk')

describe('Update patient', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(updatePatient)

  beforeEach(() => {
    clearMocks()
  })

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          patientCode: 'patientCode',
          firstName: 'John',
          lastName: 'Doe',
          birthDate: '1993-11-30',
          email: 'john.doe@awellhealth.com ',
          phone: undefined,
          mobilePhone: undefined,
          street: 'Doe Street',
          state: 'Doe York',
          country: 'United Doe',
          city: 'Doe City',
          zip: '1234',
          preferredLanguage: 'en',
          sex: 'male',
          nationalRegistryNumber: undefined,
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
    })
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call onError when email is not an actual email address the onComplete callback', async () => {
    const resp = extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          patientCode: undefined,
          firstName: undefined,
          lastName: undefined,
          birthDate: undefined,
          email: 'Not an email address',
          phone: undefined,
          mobilePhone: undefined,
          street: undefined,
          state: undefined,
          country: undefined,
          city: undefined,
          zip: undefined,
          preferredLanguage: undefined,
          sex: undefined,
          nationalRegistryNumber: undefined,
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
    })
    await expect(resp).rejects.toThrow(ZodError)
    expect(onComplete).not.toHaveBeenCalled()
  })

  test('Should call onError when phone is not a possible phone number', async () => {
    const resp = extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          patientCode: undefined,
          firstName: undefined,
          lastName: undefined,
          birthDate: undefined,
          email: undefined,
          phone: 'This is not a phone number',
          mobilePhone: undefined,
          street: undefined,
          state: undefined,
          country: undefined,
          city: undefined,
          zip: undefined,
          preferredLanguage: undefined,
          sex: undefined,
          nationalRegistryNumber: undefined,
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
    })
    await expect(resp).rejects.toThrow(ZodError)
    expect(onComplete).not.toHaveBeenCalled()
  })
})
