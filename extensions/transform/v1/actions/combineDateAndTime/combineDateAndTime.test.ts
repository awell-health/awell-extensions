import { combineDateAndTime } from '.'
import { generateTestPayload } from '@/tests'

describe('Transform - Combine date and time', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('HH:mm:ss time format', () => {
    test('Should combine date and time correctly', async () => {
      const mockOnActivityCreateParams = generateTestPayload({
        fields: {
          referenceDate: '2025-09-13T00:00:00Z',
          timeString: '17:45:00',
        },
        settings: {},
      })

      await combineDateAndTime.onActivityCreated!(
        mockOnActivityCreateParams,
        onComplete,
        onError,
      )

      expect(onComplete).toBeCalledWith({
        data_points: {
          combinedDateTime: '2025-09-13T17:45:00Z',
        },
      })
    })

    test('Should handle midnight time correctly', async () => {
      const mockOnActivityCreateParams = generateTestPayload({
        fields: {
          referenceDate: '2025-09-13T00:00:00Z',
          timeString: '00:00:00',
        },
        settings: {},
      })

      await combineDateAndTime.onActivityCreated!(
        mockOnActivityCreateParams,
        onComplete,
        onError,
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
          referenceDate: '2025-09-13T00:00:00Z',
          timeString: '23:59:59',
        },
        settings: {},
      })

      await combineDateAndTime.onActivityCreated!(
        mockOnActivityCreateParams,
        onComplete,
        onError,
      )

      expect(onComplete).toBeCalledWith({
        data_points: {
          combinedDateTime: '2025-09-13T23:59:59Z',
        },
      })
    })
  })

  describe('ISO8601 datetime with timezone', () => {
    test('Should handle timezone-aware datetime correctly (user example)', async () => {
      const mockOnActivityCreateParams = generateTestPayload({
        fields: {
          referenceDate: '2025-09-06T00:00:00Z',
          timeString: '2025-09-06T15:34:44+02:00',
        },
        settings: {},
      })

      await combineDateAndTime.onActivityCreated!(
        mockOnActivityCreateParams,
        onComplete,
        onError,
      )

      expect(onComplete).toBeCalledWith({
        data_points: {
          combinedDateTime: '2025-09-06T13:34:44Z',
        },
      })
    })

    test('Should demonstrate reference date precedence', async () => {
      const mockOnActivityCreateParams = generateTestPayload({
        fields: {
          referenceDate: '2025-09-01T00:00:00Z',
          timeString: '2025-09-06T15:34:44+02:00',
        },
        settings: {},
      })

      await combineDateAndTime.onActivityCreated!(
        mockOnActivityCreateParams,
        onComplete,
        onError,
      )

      expect(onComplete).toBeCalledWith({
        data_points: {
          combinedDateTime: '2025-09-01T13:34:44Z',
        },
      })
    })

    test('Should handle negative timezone offset', async () => {
      const mockOnActivityCreateParams = generateTestPayload({
        fields: {
          referenceDate: '2025-09-06T00:00:00Z',
          timeString: '2025-09-06T10:30:00-05:00',
        },
        settings: {},
      })

      await combineDateAndTime.onActivityCreated!(
        mockOnActivityCreateParams,
        onComplete,
        onError,
      )

      expect(onComplete).toBeCalledWith({
        data_points: {
          combinedDateTime: '2025-09-06T15:30:00Z',
        },
      })
    })

    test('Should handle UTC timezone', async () => {
      const mockOnActivityCreateParams = generateTestPayload({
        fields: {
          referenceDate: '2025-09-06T00:00:00Z',
          timeString: '2025-09-06T12:00:00Z',
        },
        settings: {},
      })

      await combineDateAndTime.onActivityCreated!(
        mockOnActivityCreateParams,
        onComplete,
        onError,
      )

      expect(onComplete).toBeCalledWith({
        data_points: {
          combinedDateTime: '2025-09-06T12:00:00Z',
        },
      })
    })

    test('Should handle timezone with milliseconds', async () => {
      const mockOnActivityCreateParams = generateTestPayload({
        fields: {
          referenceDate: '2025-09-06T00:00:00Z',
          timeString: '2025-09-06T15:34:44.123+02:00',
        },
        settings: {},
      })

      await combineDateAndTime.onActivityCreated!(
        mockOnActivityCreateParams,
        onComplete,
        onError,
      )

      expect(onComplete).toBeCalledWith({
        data_points: {
          combinedDateTime: '2025-09-06T13:34:44Z',
        },
      })
    })
  })

  describe('Error handling', () => {
    test('Should handle invalid time format', async () => {
      const mockOnActivityCreateParams = generateTestPayload({
        fields: {
          referenceDate: '2025-09-13T00:00:00Z',
          timeString: '25:70:90',
        },
        settings: {},
      })

      await combineDateAndTime.onActivityCreated!(
        mockOnActivityCreateParams,
        onComplete,
        onError,
      )

      expect(onError).toHaveBeenCalledWith({
        events: [
          {
            date: expect.any(String),
            text: { en: 'Invalid time string format' },
            error: {
              category: 'WRONG_INPUT',
              message:
                'Time string must be in ISO format HH:mm:ss (e.g., "14:30:00") or valid ISO8601 datetime with timezone (e.g., "2025-09-06T15:34:44+02:00")',
            },
          },
        ],
      })
      expect(onComplete).not.toHaveBeenCalled()
    })

    test('Should handle invalid ISO8601 format', async () => {
      const mockOnActivityCreateParams = generateTestPayload({
        fields: {
          referenceDate: '2025-09-13T00:00:00Z',
          timeString: 'invalid-datetime-string',
        },
        settings: {},
      })

      await combineDateAndTime.onActivityCreated!(
        mockOnActivityCreateParams,
        onComplete,
        onError,
      )

      expect(onError).toHaveBeenCalledWith({
        events: [
          {
            date: expect.any(String),
            text: { en: 'Invalid time string format' },
            error: {
              category: 'WRONG_INPUT',
              message:
                'Time string must be in ISO format HH:mm:ss (e.g., "14:30:00") or valid ISO8601 datetime with timezone (e.g., "2025-09-06T15:34:44+02:00")',
            },
          },
        ],
      })
      expect(onComplete).not.toHaveBeenCalled()
    })
  })
})
