import { triggerFlow } from '.'
import { generateTestPayload } from '../../../../src/tests'
import {
  mockFlowTriggeredResponse,
  mockSettings,
} from '../../api/__mocks__/mockData'

jest.mock('../../api/talkdeskClient')

describe('Talkdesk - Trigger flow', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should trigger a flow', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        flowId: '56529',
        data: JSON.stringify({ key: 'value' }),
      },
      settings: mockSettings,
    })

    await triggerFlow.onActivityCreated(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        interactionId: mockFlowTriggeredResponse.interaction_id,
        flowVersionId: mockFlowTriggeredResponse.flow_version_id,
      },
    })
  })
})
