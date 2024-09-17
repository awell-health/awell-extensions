import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { summarizeCareFlow } from '.'
import { mockPathwayActivitiesResponse } from './__mocks__/pathwayActivitiesResponse'

describe('Shelly - Summarize care flow', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(summarizeCareFlow)

  const awellSdkMock = {
    orchestration: {
      mutation: jest.fn().mockResolvedValue({}),
      query: jest.fn().mockResolvedValue({
        pathwayActivities: mockPathwayActivitiesResponse,
      }),
    },
  }

  helpers.awellSdk = jest.fn().mockResolvedValue(awellSdkMock)

  beforeEach(() => {
    clearMocks()
  })

  test('Should work', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        pathway: {
          id: 'whatever',
        },
        fields: {
          prompt: '',
        },
        settings: {
          openAiApiKey: 'a',
        },
      }),
      onComplete,
      onError,
      helpers,
    })

    expect(helpers.awellSdk).toHaveBeenCalledTimes(1)
    expect(awellSdkMock.orchestration.query).toHaveBeenCalledTimes(1)

    expect(onError).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        summary: 'Hello world',
      },
    })
  })
})
