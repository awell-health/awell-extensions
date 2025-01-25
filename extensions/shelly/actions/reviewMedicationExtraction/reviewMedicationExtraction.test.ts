import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { reviewMedicationExtraction } from '.'

describe('Shelly - Review medication extraction', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(reviewMedicationExtraction)

  beforeEach(() => {
    clearMocks()
  })

  test('Should work', async () => {
    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          imageUrl:
            'https://res.cloudinary.com/da7x4rzl4/image/upload/v1726601981/hackathon-sep-2024/seqn5izsagvs5nlferlf.png',
          medicationData: JSON.stringify({}),
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
    })

    expect(onError).not.toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
  })
})
