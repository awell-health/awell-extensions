import { generateDynamicUrl } from '.'
import { generateTestPayload } from '../../../../../src/tests'

describe('Transform - Generate dynamic URL', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should return the expected URL', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        urlTemplate: 'https://your-url.com/[placeholder]',
        value: 'hello-world',
      },
      settings: {},
    })

    await generateDynamicUrl.onActivityCreated(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toBeCalledWith({
      data_points: {
        url: 'https://your-url.com/hello-world',
      },
    })
  })

  test('Should return the expected URL', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        urlTemplate: 'https://your-url.com/[placeholder]',
        value: 'hello world, I Love you',
      },
      settings: {},
    })

    await generateDynamicUrl.onActivityCreated(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toBeCalledWith({
      data_points: {
        url: 'https://your-url.com/hello-world-i-love-you',
      },
    })
  })

  test('Should return an error if string does not contain a placeholder', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        urlTemplate: 'https://your-url.com/',
        value: 'hello-world',
      },
      settings: {},
    })

    await generateDynamicUrl.onActivityCreated(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onError).toBeCalled()
  })
})
