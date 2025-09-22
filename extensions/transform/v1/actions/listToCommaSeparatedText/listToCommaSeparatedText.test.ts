import { listToCommaSeparatedText } from '.'
import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'

describe('Transform - Parse text to number', () => {
  const { onComplete, onError, extensionAction, helpers, clearMocks } =
    TestHelpers.fromAction(listToCommaSeparatedText)

  beforeEach(() => {
    clearMocks()
  })

  test('Should transform list to comma separated text', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          list: ['option_1', 'option_2'],
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        listText: 'option_1,option_2',
      },
    })
  })

  test('Should transform stringified list to comma separated text', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          list: JSON.stringify(['option_1', 'option_2']),
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        listText: 'option_1,option_2',
      },
    })
  })
})
