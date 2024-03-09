import { enterMedication } from '.'
import { generateTestPayload } from '../../../../../src/tests'

describe('Experimental - Enter medication', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should work', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {},
      settings: {},
    })

    await enterMedication.onActivityCreated(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onError).not.toBeCalled()
    expect(onComplete).not.toBeCalled()
  })
})
