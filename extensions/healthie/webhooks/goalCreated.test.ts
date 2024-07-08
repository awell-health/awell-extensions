import { getSdk } from '../lib/sdk/generated/sdk'
import {
  mockGetSdk,
  mockGetSdkReturn,
} from '../lib/sdk/generated/__mocks__/sdk'
import { goalCreated } from './goalCreated'

jest.mock('../lib/sdk/generated/sdk')
jest.mock('../lib/sdk/graphqlClient')

describe('GoalCreated Webhook', () => {
  const onComplete = jest.fn()

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Receive a webhook', async () => {
    await goalCreated.onWebhookReceived(
      {
        payload: {
          resource_id: 72499,
          resource_id_type: 'Goal',
          event_type: 'goal.created',
        },
        settings: {
          apiUrl: 'https://api.healthieapp.com/graphql',
          apiKey: 'apiKey',
        },
        rawBody: Buffer.from(''),
        headers: {},
      },
      onComplete,
      jest.fn()
    )

    expect(mockGetSdkReturn.getGoal).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })
})
