import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { getCurrentCareflowId } from './getCurrentCareflowId'

describe('Get current care flow ID', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(getCurrentCareflowId)

  beforeEach(() => {
    clearMocks()
  })

  test('Should call the onComplete callback', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {},
        settings: {},
        pathway: {
          id: 'a-care-flow-id',
          definition_id: 'a-care-flow-definition-id',
        },
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        careFlowId: 'a-care-flow-id',
        careFlowDefinitionId: 'a-care-flow-definition-id',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })
})
