import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '../../../../../tests'
import { startCareFlowAndSession } from './startCareFlowAndSession'

jest.mock('../../sdk/awellSdk')

describe('Start care flow', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(startCareFlowAndSession)
  const sdkMock = {
    orchestration: {
      mutation: jest.fn().mockResolvedValue({
        startHostedPathwaySession: {
          pathway_id: 'a-care-flow-id',
          session_url: 'a-session-url',
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
          careFlowDefinitionId: 'definition-id',
          stakeholderDefinitionId: 'stakeholder-id',
        },
        patient: {
          id: '123',
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
        sessionUrl: 'a-session-url',
      },
      events: expect.any(Array),
    })
    expect(helpers.awellSdk).toHaveBeenCalledTimes(1)
    expect(sdkMock.orchestration.mutation).toHaveBeenCalledTimes(1)
    expect(onError).not.toHaveBeenCalled()
  })
})
