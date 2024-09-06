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
    await updatePatient.onActivityCreated!(
      {
        fields: {
          patientId: '141375220285441',
          firstName: 'This is my new first name',
          lastName: 'This is my new last name',
        },
        settings,
      } as any,
      onComplete,
      jest.fn()
    )
    expect(onComplete).toHaveBeenCalled()
  })
})
