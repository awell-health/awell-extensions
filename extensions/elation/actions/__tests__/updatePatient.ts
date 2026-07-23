import { updatePatient } from '../updatePatient'
import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'

jest.mock('../../client')

describe('Simple update patient action', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(updatePatient)
  const settings = {
    client_id: 'clientId',
    client_secret: 'clientSecret',
    username: 'username',
    password: 'password',
    auth_url: 'authUrl',
    base_url: 'baseUrl',
  }

  beforeEach(() => {
    clearMocks()
  })

  test('Should call onComplete', async () => {
    await updatePatient.onEvent!({
      payload: generateTestPayload({
        fields: {
          patientId: '141375220285441',
          firstName: 'This is my new first name',
          lastName: 'This is my new last name',
        },
        settings,
      } as any),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })
    expect(onComplete).toHaveBeenCalled()
  })
})
