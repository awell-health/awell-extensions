import { TestHelpers } from '@awell-health/extensions-core'
import { createPatient as action } from './createPatient'

describe('Epic - Create patient', () => {
  const {
    extensionAction,
    onComplete,
    onError,
    helpers,
    clearMocks,
  } = TestHelpers.fromAction(action)

  beforeEach(() => {
    clearMocks()
  })

  test('Should work', async () => {
    await extensionAction.onEvent({
      payload: {
        fields: {},
        settings: {
          apiKey: 'api-key',
        },
      } as any,
      onComplete,
      onError,
      helpers,
    })

    expect(onComplete).toHaveBeenCalled()
  })
})
