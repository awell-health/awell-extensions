import { updatePatient } from '../updatePatient'

jest.mock('../../client')

describe('Simple update patient action', () => {
  const onComplete = jest.fn()
  const settings = {
    clientId: 'clientId',
    clientSecret: 'clientSecret',
  }

  beforeEach(() => {
    onComplete.mockClear()
  })

  test('Should call onComplete', async () => {
    await updatePatient.onActivityCreated(
      {
        fields: {
          patientId: 123,
          firstName: undefined,
          lastName: undefined,
          email: undefined,
          gender: undefined,
          doctorId: undefined,
          dateOfBirth: undefined,
          race: undefined,
          preferredLanguage: undefined,
          ethnicity: undefined,
        },
        settings,
      } as any,
      onComplete,
      jest.fn()
    )
    expect(onComplete).toHaveBeenCalled()
  })
})
