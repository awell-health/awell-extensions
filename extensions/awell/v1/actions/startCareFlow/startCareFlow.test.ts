import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { startCareFlow } from './startCareFlow'

jest.mock('../../sdk/awellSdk')

describe('Start care flow', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(startCareFlow)
  const sdkMock = {
    orchestration: {
      mutation: jest.fn().mockResolvedValue({
        startPathway: {
          pathway_id: 'a-care-flow-id',
        },
      }),
    },
  }
  helpers.awellSdk = jest.fn().mockResolvedValue(sdkMock)

  beforeEach(() => {
    clearMocks()
  })

  test('Should call the onComplete callback', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          pathwayDefinitionId: 'a-pathway-definition-id',
          baselineInfo: JSON.stringify([
            {
              data_point_definition_id: 'an-id',
              value: 'a-value',
            },
          ]),
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
    })

    expect(onComplete).toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        careFlowId: 'a-care-flow-id',
      },
      events: expect.any(Array),
    })
    expect(helpers.awellSdk).toHaveBeenCalledTimes(1)
    expect(sdkMock.orchestration.mutation).toHaveBeenCalledTimes(1)
    expect(onError).not.toHaveBeenCalled()
  })
})
