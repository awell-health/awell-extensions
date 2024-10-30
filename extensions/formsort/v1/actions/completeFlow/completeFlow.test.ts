import { generateTestPayload } from '@/tests'
import { completeFlow } from './completeFlow'

describe('Complete flow action', () => {
  const onComplete = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
  })

  test('Should not call the onComplete callback', async () => {
    await completeFlow.onActivityCreated!(
      generateTestPayload({
        fields: {
          clientLabel: 'client-label',
          flowLabel: 'flow-label',
          variantLabel: 'variant-label',
        },
        settings: {
          apiKey: 'abc123',
          environment: 'production',
        },
      }),
      onComplete,
      jest.fn()
    )

    /**
     * Because completion is done in Awell Hosted Pages
     */
    expect(onComplete).not.toHaveBeenCalled()
  })
})
