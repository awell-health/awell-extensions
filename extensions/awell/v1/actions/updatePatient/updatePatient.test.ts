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
      {
        activity: {
          id: 'activity-id',
        },
        patient: { id: 'test-patient' },
        fields: {
          patientCode: 'patientCode',
          firstName: 'John',
          lastName: 'Doe',
          birthDate: '1993-11-30',
          email: 'john.doe@awellhealth.com',
          phone: '+32xxxxxxxxx',
          mobilePhone: '+32xxxxxxxxx',
          street: 'Doe Street',
          state: 'Doe York',
          country: 'United Doe',
          city: 'Doe City',
          zip: '1234',
          preferredLanguage: 'en',
          sex: 'MALE',
        },
        settings: {
          apiUrl: 'an-api-url',
          apiKey: 'an-api-key',
        },
      },
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
