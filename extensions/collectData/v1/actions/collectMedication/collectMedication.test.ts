import { collectMedication } from '.'
import { generateTestPayload } from '@/tests'

describe('Advanced data collection - Collect medication', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should work', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        label: 'Test',
      },
      settings: {},
    })

    await collectMedication.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onError).not.toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
  })
})
