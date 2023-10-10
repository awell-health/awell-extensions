import { generateTestPayload } from '../../../../src/tests'
import { getSdk } from '../../gql/sdk'
import { mockGetSdk, mockGetSdkReturn } from '../../gql/__mocks__/sdk'
import { deleteTask } from '../deleteTask'

jest.mock('../../gql/sdk')
jest.mock('../../graphqlClient')

describe('deleteTask action', () => {
  const onComplete = jest.fn()

  beforeAll(() => {
    ;(getSdk as jest.Mock).mockImplementation(mockGetSdk)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should delete a task', async () => {
    await deleteTask.onActivityCreated(
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

    expect(mockGetSdkReturn.deleteTask).toHaveBeenCalledWith({
      id: 'task-1',
    })
    expect(onComplete).toHaveBeenCalled()
  })
})
