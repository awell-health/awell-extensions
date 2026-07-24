import { generateTestPayload } from '@/tests'
import { getSdk } from '../../lib/sdk/graphql-codegen/generated/sdk'
import { TestHelpers } from '@awell-health/extensions-core'
import {
  mockGetSdk,
  mockGetSdkReturn,
} from '../../lib/sdk/graphql-codegen/generated/__mocks__/sdk'
import { completeTask } from '../completeTask'

jest.mock('../../lib/sdk/graphql-codegen/generated/sdk')
jest.mock('../../lib/sdk/graphql-codegen/graphqlClient')

describe('completeTask action', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(completeTask)

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should complete a task', async () => {
    await completeTask.onEvent!({
      payload: generateTestPayload({
        fields: {
          id: 'task-1',
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

    expect(mockGetSdkReturn.updateTask).toHaveBeenCalledWith({
      input: {
        id: 'task-1',
        complete: true,
      },
    })
    expect(onComplete).toHaveBeenCalled()
  })
})
