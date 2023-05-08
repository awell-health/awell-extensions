import { createPatient } from '../createPatient'
import { NoCache } from '../../../../services/cache/cache'

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
    await createPatient.onActivityCreated(
      {
        fields: {
          first_name: 'Test',
          middle_name: 'P',
          last_name: 'Action',
          actual_name: 'local test action',
          gender_identity: 'man',
          legal_gender_marker: 'M',
          pronouns: 'he_him_his',
          sex: 'Male',
          sexual_orientation: 'unknown',
          primary_physician: 141127177601026,
          caregiver_practice: 141127173275652,
          dob: '1940-08-29',
          ssn: '123456789',
          race: 'Asian',
          preferred_language: 'English',
          ethnicity: 'Not Hispanic or Latino',
          notes: 'This is test Notes',
          previous_first_name: '',
          previous_last_name: '',
        },
        settings,
      } as any,
      onComplete,
      jest.fn(),
      { authCacheService: new NoCache() }
    )
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        patientId: '1',
      },
    })
  })
})
