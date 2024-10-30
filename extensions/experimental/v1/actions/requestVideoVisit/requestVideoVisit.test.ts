import { requestVideoVisit } from '.'
import { generateTestPayload } from '@/tests'

describe('Experimental - Request video visit', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should work', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        deepLink: 'https://www.google.be',
      },
      settings: {},
    })

    await requestVideoVisit.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onError).not.toBeCalled()
  })

  test('Should not work', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        deepLink: true,
      },
      settings: {},
    })

    await requestVideoVisit.onActivityCreated!(
      // @ts-expect-error zod will catch this
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onError).toBeCalled()
  })
})
