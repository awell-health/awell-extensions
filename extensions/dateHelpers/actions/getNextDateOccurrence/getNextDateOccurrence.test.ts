import { TestHelpers } from '@awell-health/extensions-core'
import { getNextDateOccurrence } from './getNextDateOccurrence'
import { generateTestPayload } from '../../../../tests/constants'

describe('Date Helpers - getNextDateOccurrence', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(getNextDateOccurrence)

  beforeEach(() => {
    clearMocks()
  })

  beforeAll(() => {
    jest.useFakeTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  describe('when no reference date is provided', () => {
    it('returns the next occurrence of today when reference date is omitted', async () => {
      jest.setSystemTime(new Date('2025-12-04T12:00:00.000Z'))

      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            referenceDate: undefined,
          },
          settings: {},
        }),
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          nextDateOccurrence: '2026-12-04T00:00:00.000Z',
        },
      })
    })
  })

  describe('when a reference date is provided', () => {
    it('returns the first future occurrence after today when the reference date is in the past (different year)', async () => {
      jest.setSystemTime(new Date('2025-12-01T12:00:00.000Z'))

      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            referenceDate: '2020-11-01T12:00:00.000Z',
          },
          settings: {},
        }),
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          nextDateOccurrence: '2026-11-01T00:00:00.000Z',
        },
      })
    })

    it('returns the first future occurrence after today when the reference date is earlier in the same year', async () => {
      jest.setSystemTime(new Date('2025-12-01T12:00:00.000Z'))

      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            referenceDate: '2025-11-01T12:00:00.000Z',
          },
          settings: {},
        }),
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          nextDateOccurrence: '2026-11-01T00:00:00.000Z',
        },
      })
    })

    it('returns the first future occurrence after the reference date when the reference date is in the future', async () => {
      jest.setSystemTime(new Date('2025-12-01T12:00:00.000Z'))

      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            referenceDate: '2030-11-01T12:00:00.000Z',
          },
          settings: {},
        }),
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          nextDateOccurrence: '2031-11-01T00:00:00.000Z',
        },
      })
    })

    it('returns next-year occurrence when reference date is exactly today', async () => {
      jest.setSystemTime(new Date('2025-12-04T12:00:00.000Z'))
    
      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            referenceDate: '2025-12-04T12:00:00.000Z',
          },
          settings: {},
        }),
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })
    
      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          nextDateOccurrence: '2026-12-04T00:00:00.000Z',
        },
      })
    })

    it('returns the next valid leap-day occurrence when reference date is a past Feb 29', async () => {
      // Today: 2025-03-01 (non-leap year, after 2024-02-29)
      jest.setSystemTime(new Date('2025-03-01T12:00:00.000Z'))
    
      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            referenceDate: '2024-02-29T12:00:00.000Z',
          },
          settings: {},
        }),
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })
    
      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          nextDateOccurrence: '2028-02-29T00:00:00.000Z',
        },
      })
    })

    it('returns the next leap-day occurrence after the reference date when reference date is a future Feb 29', async () => {
      jest.setSystemTime(new Date('2025-03-01T12:00:00.000Z'))
    
      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            referenceDate: '2028-02-29T12:00:00.000Z',
          },
          settings: {},
        }),
        onComplete,
        onError,
        helpers,
        attempt: 1,
      })
    
      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          nextDateOccurrence: '2032-02-29T00:00:00.000Z',
        },
      })
    })
    
  })
})
