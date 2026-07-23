import { generateTestPayload } from '@/tests'
import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
import { TestHelpers } from '@awell-health/extensions-core'
import {
  mockGetSdk,
  mockGetSdkReturn,
} from '../../lib/sdk/graphql-codegen/generated/__mocks__/sdk'
import { createJournalEntry } from '../createJournalEntry'

jest.mock('../../lib/sdk/graphql-codegen/generated/sdk')
jest.mock('../../lib/sdk/graphql-codegen/graphqlClient')

describe('createJournalEntry action', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(createJournalEntry)

  beforeAll(() => {
    const mock = getSdk as jest.Mock
    mock.mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should create a journal entry', async () => {
    await createJournalEntry.onEvent!({
      payload: generateTestPayload({
        fields: {
          id: 'patient-1',
          type: 'MetricEntry',
          percieved_hungriness: 1,
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

    expect(mockGetSdkReturn.createJournalEntry).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })
})
