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
          list: 'two,three',
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        listText: 'two,three',
      },
    })
  })
})
