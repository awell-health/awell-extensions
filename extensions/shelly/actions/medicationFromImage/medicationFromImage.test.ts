import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { medicationFromImage } from '.'

describe('Shelly - Medication From Image', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(medicationFromImage)

  beforeEach(() => {
    clearMocks()
  })

  test('Should work', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          imageUrl:
            'https://res.cloudinary.com/da7x4rzl4/image/upload/v1726601981/hackathon-sep-2024/seqn5izsagvs5nlferlf.png',
        },
        settings: {
          openAiApiKey: 'a',
        },
      }),
      onComplete,
      onError,
      helpers,
    })

    expect(onError).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalled()
  })
})
