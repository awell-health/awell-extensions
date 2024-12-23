import { testPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'
import { HealthieSdk } from '@awell-health/healthie-sdk'
import { lockFormAnswerGroup as actionInterface } from '.'

jest.mock('@awell-health/healthie-sdk', () => ({
  HealthieSdk: jest.fn().mockImplementation(() => ({
    client: {
      mutation: jest.fn().mockResolvedValue({
        lockFormAnswerGroup: { id: '74765' },
      }),
    },
  })),
}))

const mockedHealthieSdk = jest.mocked(HealthieSdk)

describe('Healthie - Lock form answer group', () => {
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
          id: '43576',
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
    expect(onComplete).toHaveBeenCalled()
  })
})
