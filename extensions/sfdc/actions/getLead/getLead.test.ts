import { TestHelpers } from '@awell-health/extensions-core'
import { getLead as actionInterface } from '.'
import { generateTestPayload } from '@/tests'
import { mockSettings } from '../../api/__mocks__'

jest.mock('../../api/client')

describe('Salesforce - Get Lead', () => {
  const {
    extensionAction: action,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(actionInterface)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
  })

  test('Should get a lead', async () => {
    await action.onEvent({
      payload: generateTestPayload({
        fields: {
          leadId: '00QPb00000HaFQAMA3',
        },
        settings: mockSettings,
      }),
      onComplete,
      onError,
      helpers,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        leadData: expect.any(String),
      },
    })
  })
})
