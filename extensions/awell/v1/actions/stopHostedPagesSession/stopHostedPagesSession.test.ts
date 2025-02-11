import { TestHelpers } from '@awell-health/extensions-core'
import { stopHostedPagesSession as action } from './stopHostedPagesSession'

describe('Stop hosted pages session', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  test('Should call not call the onComplete callback', async () => {
    await extensionAction.onEvent({
      payload: {
        fields: {
          title: 'Title',
          subtitle: 'Subtitle',
        },
        settings: {},
      } as any,
      onComplete,
      onError,
      helpers,
    })

    // Completion of the activity happens in the Hosted Pages app
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
