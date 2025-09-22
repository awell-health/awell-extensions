import { TestHelpers } from '@awell-health/extensions-core'
import { tasksMock } from './__testdata__/completedTasks.mock'
import { getLastTaskPerformer as action } from './getLastTaskPerformer'

const mockGetTasks = jest.fn().mockResolvedValue({
  data: tasksMock,
})

const mockTasksApiClient = {
  getTasks: mockGetTasks,
}

jest.mock('../../api/client', () => ({
  TasksApiClient: jest.fn().mockImplementation(() => mockTasksApiClient),
}))

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
      attempt: 1,
    })

    expect(mockTasksApiClient.getTasks).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        data_points: {
          stytchUserId: 'stytch-member-id',
          email: 'nick@awellhealth.com',
        },
      }),
    )
  })

  test('Should work when there is no performer', async () => {
    const tasksMockWithoutPerformer = {
      ...tasksMock,
      tasks: tasksMock.tasks.map((task) => ({
        ...task,
        performer: null,
      })),
    }

    mockTasksApiClient.getTasks.mockResolvedValue({
      data: tasksMockWithoutPerformer,
    })

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
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        data_points: {
          stytchUserId: undefined,
          email: undefined,
        },
        events: expect.arrayContaining([
          expect.objectContaining({
            date: expect.any(String),
            text: expect.objectContaining({
              en: expect.stringMatching(
                'The last completed task in this care flow .* has no performer.',
              ),
            }),
          }),
        ]),
      }),
    )
  })
})
