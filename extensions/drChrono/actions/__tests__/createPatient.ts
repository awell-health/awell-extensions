import { createPatient } from '../createPatient'

jest.mock('../../client')

describe('Simple create patient action', () => {
  const onComplete = jest.fn()
  const settings = {
    clientId: 'clientId',
    clientSecret: 'clientSecret',
  }

  beforeEach(() => {
    onComplete.mockClear()
  })

  test('Should return with correct data_points', async () => {
    await createPatient.onActivityCreated(
      {
        fields: {
          firstName: 'Test',
          lastName: 'Action',
          email: 'patient@test.com',
          gender: 'male',
          doctorId: 123,
          dateOfBirth: '1940-08-29',
          race: 'asian',
          preferredLanguage: 'eng',
          ethnicity: 'blank',
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
