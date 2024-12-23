import { testPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'
import { HealthieSdk } from '@awell-health/healthie-sdk'
import { getSetPasswordLink as actionInterface } from '.'

jest.mock('@awell-health/healthie-sdk', () => ({
  HealthieSdk: jest.fn().mockImplementation(() => ({
    client: {
      mutation: jest.fn(),
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
  let mockedClient: any

  const {
    extensionAction: action,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(actionInterface)

  beforeEach(() => {
    clearMocks()
    mockedClient = {
      query: jest.fn(),
      mutation: jest.fn(),
    }
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

  test('Should retry if set_password_link is null and succeed after retries', async () => {
    // Mock the SDK to return null for the first two attempts, and succeed on the third attempt
    mockedClient.query
      .mockResolvedValueOnce({ user: { set_password_link: null } }) // First attempt
      .mockResolvedValueOnce({ user: { set_password_link: null } }) // Second attempt
      .mockResolvedValueOnce({
        user: {
          set_password_link:
            'https://securestaging.gethealthie.com/set_initial_password?signup_token=some-token',
        },
      }) // Third attempt
    ;(HealthieSdk as jest.Mock).mockImplementationOnce(() => ({
      client: mockedClient,
    }))

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

    // Ensure the query was called 3 times and succeeded on the third attempt
    expect(mockedClient.query).toHaveBeenCalledTimes(3)
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        setPasswordLink:
          'https://securestaging.gethealthie.com/set_initial_password?signup_token=some-token',
      },
    })
  })
})
