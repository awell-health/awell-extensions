import { triggerFlow } from '.'
import { generateTestPayload } from '@/tests'
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
        flowId: 'dc971dd4c8044b1da94689737d42655f',
        data: JSON.stringify({}),
        autoComplete: true,
      },
      settings: mockSettings,
    })

    await triggerFlow.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        interactionId: mockFlowTriggeredResponse.interaction_id,
        flowVersionId: mockFlowTriggeredResponse.flow_version_id,
      },
      events: expect.any(Array),
    })
  })
})
