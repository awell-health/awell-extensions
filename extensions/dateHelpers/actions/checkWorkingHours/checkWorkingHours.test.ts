import { TestHelpers } from '@awell-health/extensions-core'
import { checkWorkingHours } from './checkWorkingHours'
import { generateTestPayload } from '../../../../tests/constants'

describe('checkWorkingHours', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(checkWorkingHours)

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Within working hours', () => {
    it('Should return true when current time is within working hours', async () => {
      // Set current time to 2024-01-15 10:30 UTC (within 09:00-17:00 UTC)
      jest.setSystemTime(new Date('2024-01-15T10:30:00.000Z'))

      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            workingHoursStart: '09:00',
            workingHoursEnd: '17:00',
            timezone: 'UTC',
          },
          settings: {},
        }),
        onComplete,
        onError,
        helpers,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          isWithinWorkingHours: 'true',
          minutesToNextWorkingHours: undefined,
          nextWorkingHoursDatetime: undefined,
        },
      })
      expect(onError).not.toHaveBeenCalled()
    })

    it('Should return true at the exact start of working hours', async () => {
      // Set current time to 2024-01-15 09:00 UTC
      jest.setSystemTime(new Date('2024-01-15T09:00:00.000Z'))

      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            workingHoursStart: '09:00',
            workingHoursEnd: '17:00',
            timezone: 'UTC',
          },
          settings: {},
        }),
        onComplete,
        onError,
        helpers,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          isWithinWorkingHours: 'true',
          minutesToNextWorkingHours: undefined,
          nextWorkingHoursDatetime: undefined,
        },
      })
    })

    it('Should return false at the exact end of working hours', async () => {
      // Set current time to 2024-01-15 17:00 UTC (end time is exclusive)
      jest.setSystemTime(new Date('2024-01-15T17:00:00.000Z'))
      // Real timezone conversion will be used automatically

      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            workingHoursStart: '09:00',
            workingHoursEnd: '17:00',
            timezone: 'UTC',
          },
          settings: {},
        }),
        onComplete,
        onError,
        helpers,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          isWithinWorkingHours: 'false',
          minutesToNextWorkingHours: '960', // 16 hours until next day 9:00
          nextWorkingHoursDatetime: '2024-01-16T09:00:00.000Z', // Next day at 9:00 UTC
        },
      })
    })
  })

  describe('Outside working hours - before', () => {
    it('Should return false and calculate minutes until working hours start', async () => {
      // Set current time to 2024-01-15 07:30 UTC (1.5 hours before 09:00)
      jest.setSystemTime(new Date('2024-01-15T07:30:00.000Z'))
      // Real timezone conversion will be used automatically

      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            workingHoursStart: '09:00',
            workingHoursEnd: '17:00',
            timezone: 'UTC',
          },
          settings: {},
        }),
        onComplete,
        onError,
        helpers,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          isWithinWorkingHours: 'false',
          minutesToNextWorkingHours: '90', // 1.5 hours = 90 minutes
          nextWorkingHoursDatetime: '2024-01-15T09:00:00.000Z', // Today at 9:00 UTC
        },
      })
    })

    it('Should handle early morning hours correctly', async () => {
      // Set current time to 2024-01-15 06:00 UTC (3 hours before 09:00)
      jest.setSystemTime(new Date('2024-01-15T06:00:00.000Z'))
      // Real timezone conversion will be used automatically

      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            workingHoursStart: '09:00',
            workingHoursEnd: '17:00',
            timezone: 'UTC',
          },
          settings: {},
        }),
        onComplete,
        onError,
        helpers,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          isWithinWorkingHours: 'false',
          minutesToNextWorkingHours: '180', // 3 hours = 180 minutes
          nextWorkingHoursDatetime: '2024-01-15T09:00:00.000Z', // Today at 9:00 UTC
        },
      })
    })
  })

  describe('Outside working hours - after', () => {
    it('Should return false and calculate minutes until next day working hours', async () => {
      // Set current time to 2024-01-15 18:30 UTC (1.5 hours after 17:00)
      jest.setSystemTime(new Date('2024-01-15T18:30:00.000Z'))
      // Real timezone conversion will be used automatically

      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            workingHoursStart: '09:00',
            workingHoursEnd: '17:00',
            timezone: 'UTC',
          },
          settings: {},
        }),
        onComplete,
        onError,
        helpers,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          isWithinWorkingHours: 'false',
          minutesToNextWorkingHours: '870', // 5.5 hours until midnight + 9 hours = 14.5 hours = 870 minutes
          nextWorkingHoursDatetime: '2024-01-16T09:00:00.000Z', // Next day at 9:00 UTC
        },
      })
    })

    it('Should handle late night hours correctly', async () => {
      // Set current time to 2024-01-15 23:00 UTC
      jest.setSystemTime(new Date('2024-01-15T23:00:00.000Z'))
      // Real timezone conversion will be used automatically

      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            workingHoursStart: '09:00',
            workingHoursEnd: '17:00',
            timezone: 'UTC',
          },
          settings: {},
        }),
        onComplete,
        onError,
        helpers,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          isWithinWorkingHours: 'false',
          minutesToNextWorkingHours: '600', // 1 hour until midnight + 9 hours = 10 hours = 600 minutes
          nextWorkingHoursDatetime: '2024-01-16T09:00:00.000Z', // Next day at 9:00 UTC
        },
      })
    })
  })

  describe('Timezone handling', () => {
    it('Should handle different timezones correctly', async () => {
      // Set current time to 2024-01-15 15:00 UTC
      // In New York (EST, UTC-5), this would be 10:00 AM (within 09:00-17:00)
      jest.setSystemTime(new Date('2024-01-15T15:00:00.000Z'))
      // Real timezone conversion will be used automatically

      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            workingHoursStart: '09:00',
            workingHoursEnd: '17:00',
            timezone: 'America/New_York',
          },
          settings: {},
        }),
        onComplete,
        onError,
        helpers,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          isWithinWorkingHours: 'true',
          minutesToNextWorkingHours: undefined,
          nextWorkingHoursDatetime: undefined,
        },
      })
    })

    it('Should default to UTC when no timezone is provided', async () => {
      // Set current time to 2024-01-15 10:30 UTC
      jest.setSystemTime(new Date('2024-01-15T10:30:00.000Z'))
      // Real timezone conversion will be used automatically

      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            workingHoursStart: '09:00',
            workingHoursEnd: '17:00',
            timezone: 'UTC',
          },
          settings: {},
        }),
        onComplete,
        onError,
        helpers,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          isWithinWorkingHours: 'true',
          minutesToNextWorkingHours: undefined,
          nextWorkingHoursDatetime: undefined,
        },
      })
    })
  })

  describe('Different working hours', () => {
    it('Should handle non-standard working hours', async () => {
      // Set current time to 2024-01-15 11:30 UTC (within 10:00-15:00)
      jest.setSystemTime(new Date('2024-01-15T11:30:00.000Z'))
      // Real timezone conversion will be used automatically

      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            workingHoursStart: '10:00',
            workingHoursEnd: '15:00',
            timezone: 'UTC',
          },
          settings: {},
        }),
        onComplete,
        onError,
        helpers,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          isWithinWorkingHours: 'true',
          minutesToNextWorkingHours: undefined,
          nextWorkingHoursDatetime: undefined,
        },
      })
    })

    it('Should handle early morning working hours', async () => {
      // Set current time to 2024-01-15 07:30 UTC (within 06:00-14:00)
      jest.setSystemTime(new Date('2024-01-15T07:30:00.000Z'))
      // Real timezone conversion will be used automatically

      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            workingHoursStart: '06:00',
            workingHoursEnd: '14:00',
            timezone: 'UTC',
          },
          settings: {},
        }),
        onComplete,
        onError,
        helpers,
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          isWithinWorkingHours: 'true',
          minutesToNextWorkingHours: undefined,
          nextWorkingHoursDatetime: undefined,
        },
      })
    })
  })

  describe('Error handling', () => {
    it('Should handle invalid time format', async () => {
      await expect(
        extensionAction.onEvent({
          payload: generateTestPayload({
            fields: {
              workingHoursStart: 'invalid', // Invalid format
              workingHoursEnd: '17:00',
              timezone: 'UTC',
            },
            settings: {},
          }),
          onComplete,
          onError,
          helpers,
        }),
      ).rejects.toThrow()

      expect(onComplete).not.toHaveBeenCalled()
    })

    it('Should handle end time before start time', async () => {
      jest.setSystemTime(new Date('2024-01-15T10:30:00.000Z'))
      // Real timezone conversion will be used automatically

      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            workingHoursStart: '17:00',
            workingHoursEnd: '09:00', // End before start
            timezone: 'UTC',
          },
          settings: {},
        }),
        onComplete,
        onError,
        helpers,
      })

      expect(onError).toHaveBeenCalledWith({
        events: [
          {
            date: expect.any(String),
            text: {
              en: 'Working hours end time must be after start time. Cross-midnight hours are not supported.',
            },
            error: {
              category: 'BAD_REQUEST',
              message: 'Working hours end time must be after start time',
            },
          },
        ],
      })
      expect(onComplete).not.toHaveBeenCalled()
    })

    it('Should handle same start and end time', async () => {
      jest.setSystemTime(new Date('2024-01-15T10:30:00.000Z'))
      // Real timezone conversion will be used automatically

      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            workingHoursStart: '09:00',
            workingHoursEnd: '09:00', // Same as start
            timezone: 'UTC',
          },
          settings: {},
        }),
        onComplete,
        onError,
        helpers,
      })

      expect(onError).toHaveBeenCalledWith({
        events: [
          {
            date: expect.any(String),
            text: {
              en: 'Working hours end time must be after start time. Cross-midnight hours are not supported.',
            },
            error: {
              category: 'BAD_REQUEST',
              message: 'Working hours end time must be after start time',
            },
          },
        ],
      })
      expect(onComplete).not.toHaveBeenCalled()
    })
  })
})
