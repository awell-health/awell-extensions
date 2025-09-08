import { combineDateAndTime } from '.'
import { generateTestPayload } from '@/tests'

describe('Transform - Combine date and time', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should combine date and time correctly', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        referenceDate: '2025-09-13',
        timeString: '17:45:00',
      },
      settings: {},
    })

    await combineDateAndTime.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toBeCalledWith({
      data_points: {
        combinedDateTime: '2025-09-13T17:45:00Z',
      },
    })
  })

  test('Should handle invalid time format', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        referenceDate: '2025-09-13',
        timeString: '25:70:90',
      },
      settings: {},
    })

    await combineDateAndTime.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onError).toHaveBeenCalled()
    expect(onComplete).not.toHaveBeenCalled()
  })

  test('Should handle midnight time correctly', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        referenceDate: '2025-09-13',
        timeString: '00:00:00',
      },
      settings: {},
    })

    await combineDateAndTime.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toBeCalledWith({
      data_points: {
        combinedDateTime: '2025-09-13T00:00:00Z',
      },
    })
  })

  test('Should handle end of day time correctly', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        referenceDate: '2025-09-13',
        timeString: '23:59:59',
      },
      settings: {},
    })

    await combineDateAndTime.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toBeCalledWith({
      data_points: {
        combinedDateTime: '2025-09-13T23:59:59Z',
      },
    })
  })
})
