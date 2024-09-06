import { generateTestPayload } from '../../../../src/tests'
import { getSdk } from '../../lib/sdk/generated/sdk'
import {
  mockGetSdk,
  mockGetSdkReturn,
} from '../../lib/sdk/generated/__mocks__/sdk'
import { completeTask } from '../completeTask'

jest.mock('../../lib/sdk/generated/sdk')
jest.mock('../../lib/sdk/graphqlClient')

describe('completeTask action', () => {
  const onComplete = jest.fn()

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should complete a task', async () => {
    await completeTask.onActivityCreated!(
      generateTestPayload({
        fields: {
          id: 'task-1',
        },
        settings: {
          apiKey: 'apiKey',
          apiUrl: 'test-url',
        },
      }),
      onComplete,
      jest.fn()
    )

    expect(mockGetSdkReturn.updateTask).toHaveBeenCalledWith({
      input: {
        id: 'task-1',
        complete: true,
      },
    })
    expect(onComplete).toHaveBeenCalled()
  })
})
