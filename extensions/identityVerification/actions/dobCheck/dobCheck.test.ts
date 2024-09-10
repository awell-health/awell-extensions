import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { dobCheck } from '.'

describe('Identity verification - DOB check', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(dobCheck)

  beforeEach(() => {
    clearMocks()
  })

  test('Should work', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          dobCheck: 'Enter your date of birth to verify your identity',
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
    })

    /**
     * Because completion is handled in Awell Hosted Pages
     */
    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })
})
