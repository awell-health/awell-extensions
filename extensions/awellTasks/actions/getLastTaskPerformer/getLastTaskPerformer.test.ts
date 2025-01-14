import { TestHelpers } from '@awell-health/extensions-core'
import { TasksApiClient } from '../../api/client'
import { getLastTaskPerformer as action } from './getLastTaskPerformer'
import { tasksMock } from './__testdata__/completedTasks.mock'

jest.mock('../../api/client', () => ({
  TasksApiClient: jest.fn().mockImplementation(() => ({
    getTasks: jest.fn().mockResolvedValue({
      data: tasksMock,
    }),
  })),
}))

const mockedSdk = jest.mocked(TasksApiClient)

describe('Task Service - Get last task performer', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  test('Should work', async () => {
    await extensionAction.onEvent({
      payload: {
        fields: {},
        pathway: {
          id: 'pathway-id',
        },
        settings: {
          baseUrl: 'https://api.awellhealth.com',
          apiKey: 'api-key',
        },
      } as any,
      onComplete,
      onError,
      helpers,
    })

    expect(mockedSdk).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        stytchUserId: 'stytch-member-id',
        email: 'nick@awellhealth.com',
      },
    })
  })
})
