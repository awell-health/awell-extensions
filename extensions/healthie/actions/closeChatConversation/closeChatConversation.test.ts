import { generateTestPayload } from '@/tests'
import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
import { TestHelpers } from '@awell-health/extensions-core'
import {
  mockGetSdk,
  mockGetSdkReturn,
} from '../../lib/sdk/graphql-codegen/generated/__mocks__/sdk'
import { closeChatConversation } from '../closeChatConversation'

jest.mock('../../lib/sdk/graphql-codegen/generated/sdk')
jest.mock('../../lib/sdk/graphql-codegen/graphqlClient')

describe('closeChatConversation action', () => {
  const { onComplete, onError, helpers, clearMocks } = TestHelpers.fromAction(
    closeChatConversation,
  )

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should close a conversation', async () => {
    await closeChatConversation.onEvent!({
      payload: generateTestPayload({
        fields: {
          id: 'conversation-1',
          provider_id: 'provider-1',
        },
        settings: {
          apiKey: 'apiKey',
          apiUrl: 'test-url',
          formAnswerMaxSizeKB: undefined,
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(mockGetSdkReturn.updateConversation).toHaveBeenCalledWith({
      input: {
        id: 'conversation-1',
        closed_by_id: 'provider-1',
      },
    })
    expect(onComplete).toHaveBeenCalled()
  })
})
