import { createPatient } from '../createPatient'

jest.mock('../../client')

describe('Simple create patient action', () => {
  const onComplete = jest.fn()
  const settings = {
    client_id: 'clientId',
    client_secret: 'clientSecret',
    username: 'username',
    password: 'password',
    auth_url: 'authUrl',
    base_url: 'baseUrl',
  }

  beforeEach(() => {
    onComplete.mockClear()
  })

  test('Should return with correct data_points', async () => {
    await createPatient.onActivityCreated!(
      {
        fields: {
          firstName: 'Test',
          middleName: 'P',
          lastName: 'Action',
          email: 'john@doe.com',
          mobilePhone: '+12133734253',
          actualName: 'local test action',
          genderIdentity: 'man',
          legalGenderMarker: 'M',
          pronouns: 'he_him_his',
          sex: 'Male',
          sexualOrientation: 'unknown',
          primaryPhysicianId: 141127177601026,
          caregiverPracticeId: 141127173275652,
          dob: '1940-08-29',
          ssn: '123456789',
          race: 'Asian',
          preferredLanguage: 'English',
          ethnicity: 'Not Hispanic or Latino',
          notes: 'This is test Notes',
          previousFirstName: '',
          previousLastName: '',
        },
        settings,
      } as any,
      onComplete,
      jest.fn()
    )
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        patientId: '1',
      },
    })
  })
})
