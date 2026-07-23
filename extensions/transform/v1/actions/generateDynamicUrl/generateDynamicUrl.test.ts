import { generateDynamicUrl } from '.'
import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'

describe('Transform - Generate dynamic URL', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(generateDynamicUrl)

  beforeEach(() => {
    clearMocks()
  })

  test('Should return the expected URL', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        urlTemplate: 'https://your-url.com/[placeholder]',
        value: 'hello-world',
      },
      settings: {},
    })

    await generateDynamicUrl.onEvent!({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toBeCalledWith({
      data_points: {
        url: 'https://your-url.com/hello-world',
      },
    })
  })

  test('Should return the expected URL when value is empty', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        urlTemplate: 'https://your-url.com/[placeholder]',
        value: undefined,
      },
      pathway: {
        id: '234d0IOB_zov',
      },
      settings: {},
    })

    await generateDynamicUrl.onEvent!({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toBeCalledWith({
      data_points: {
        url: 'https://your-url.com/234d0IOB_zov',
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

    await generateDynamicUrl.onEvent!({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onError).toBeCalled()
  })
})
