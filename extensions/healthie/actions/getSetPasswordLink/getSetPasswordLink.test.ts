import { testPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'
import { HealthieSdk } from '@extensions/healthie/lib/sdk/genql'
import { getSetPasswordLink as actionInterface } from '.'

jest.mock('@extensions/healthie/lib/sdk/genql', () => ({
  HealthieSdk: jest.fn().mockImplementation(() => ({
    client: {
      query: jest.fn().mockResolvedValue({
        user: {
          set_password_link:
            'https://securestaging.gethealthie.com/set_initial_password?signup_token=some-token',
        },
      }),
    },
  })),
}))

const mockedHealthieSdk = jest.mocked(HealthieSdk)

describe('Healthie - Get password link', () => {
  const {
    extensionAction: action,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(actionInterface)

  beforeEach(() => {
    clearMocks()
  })

  test('Should call onComplete', async () => {
    await action.onEvent({
      payload: {
        ...testPayload,
        fields: {
          healthiePatientId: '453019',
        },
        settings: {
          apiUrl: 'https://staging-api.gethealthie.com/graphql',
          apiKey: 'apiKey',
        },
      },
      onComplete,
      onError,
      helpers,
    })

    expect(mockedHealthieSdk).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        setPasswordLink:
          'https://securestaging.gethealthie.com/set_initial_password?signup_token=some-token',
      },
    })
  })
})
