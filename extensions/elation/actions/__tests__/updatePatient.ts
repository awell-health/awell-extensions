import { updatePatient } from '..'

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
          patient_id: '141375220285441',
          first_name: "Paula",
          middle_name: "P",
          last_name: "Patient",
          actual_name: "Paul Patient",
          gender_identity: "woman",
          legal_gender_marker: "F",
          pronouns: "he_him_his",
          sex: "Female",
          sexual_orientation: "queer",
          primary_physician: 141127177601026,
          caregiver_practice: 141127173275652,
          dob: "1940-08-29",
          ssn: "123456789",
          race: "Asian",
          preferred_language: "English",
          ethnicity: "Not Hispanic or Latino",
          notes: "This is test Notes",
          previous_first_name: "",
          previous_last_name: "",
        },
        settings,
      } as any,
      onComplete,
      jest.fn()
    )
    expect(onComplete).toHaveBeenCalled()
  })
})
