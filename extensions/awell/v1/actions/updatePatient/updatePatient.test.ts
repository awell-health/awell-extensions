import { generateTestPayload } from '../../../../../src/tests'
import { updatePatient } from './updatePatient'

jest.mock('../../sdk/awellSdk')

describe('Update patient', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should call the onComplete callback', async () => {
    await updatePatient.onActivityCreated(
      generateTestPayload({
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
        settings: {
          apiUrl: 'an-api-url',
          apiKey: 'an-api-key',
        },
      }),
      onComplete,
      onError,
    )
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should call onError when email is not an actual email address the onComplete callback', async () => {
    await updatePatient.onActivityCreated(
      generateTestPayload({
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
        settings: {
          apiUrl: 'an-api-url',
          apiKey: 'an-api-key',
        },
      }),
      onComplete,
      onError,
    )
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith({
      events: expect.arrayContaining([
        expect.objectContaining({
          error: {
            category: 'WRONG_INPUT',
            message:
              'Validation error: Value passed is not an email address at "fields.email"',
          },
        }),
      ]),
    })
  })

  test('Should call onError when phone is not a possible phone number', async () => {
    await updatePatient.onActivityCreated(
      generateTestPayload({
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
        settings: {
          apiUrl: 'an-api-url',
          apiKey: 'an-api-key',
        },
      }),
      onComplete,
      onError,
    )
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith({
      events: expect.arrayContaining([
        expect.objectContaining({
          error: {
            category: 'WRONG_INPUT',
            message:
              'Validation error: Phone number is invalid (NOT_A_NUMBER) at "fields.phone"',
          },
        }),
      ]),
    })
  })
})
