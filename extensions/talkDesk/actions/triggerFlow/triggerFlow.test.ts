import { triggerFlow } from '.'
import { generateTestPayload } from '@/tests'
import {
  mockFlowTriggeredResponse,
  mockSettings,
} from '../../api/__mocks__/mockData'
import { TestHelpers } from '@awell-health/extensions-core'

jest.mock('../../api/talkdeskClient')

describe('Talkdesk - Trigger flow', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(triggerFlow)

  beforeEach(() => {
    jest.clearAllMocks()
    clearMocks()
  })

  test('Should trigger a flow', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        flowId: 'dc971dd4c8044b1da94689737d42655f',
        data: JSON.stringify({}),
        autoComplete: true,
      },
      settings: mockSettings,
    })

    await triggerFlow.onEvent!({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        interactionId: mockFlowTriggeredResponse.interaction_id,
        flowVersionId: mockFlowTriggeredResponse.flow_version_id,
      },
      events: expect.any(Array),
    })
  })
})
