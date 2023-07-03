import { updatePatient } from '../updatePatient'

jest.mock('../../client')

describe('Simple update patient action', () => {
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

  test('Should call onComplete', async () => {
    await updatePatient.onActivityCreated(
      {
        fields: {
          patientId: '141375220285441',
          firstName: 'Paula',
          middleName: 'P',
          lastName: 'Patient',
          actualName: 'Paul Patient',
          genderIdentity: 'woman',
          legalGenderMarker: 'F',
          pronouns: 'he_him_his',
          sex: 'Female',
          sexualOrientation: 'queer',
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
    expect(onComplete).toHaveBeenCalled()
  })
})
