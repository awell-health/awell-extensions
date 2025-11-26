import { TestHelpers } from '@awell-health/extensions-core'
import { getNextWorkday } from './getNextWorkday'
import { generateTestPayload } from '../../../../tests/constants'

describe('Date Helpers - getNextWorkday', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(getNextWorkday)

  beforeEach(() => {
    clearMocks()
  })

  describe('Without reference date', () => {
    beforeAll(() => {
      jest.useFakeTimers()
    })

    afterAll(() => {
      jest.useRealTimers()
    })

    describe('With includeReferenceDate set to true', () => {
      const tests = [
        {
          today: '2025-11-25T12:00:00.000Z', // Tuesday
          expected: '2025-11-26T00:00:00.000Z',
          expectedReferenceDateIsWeekday: true,
        },
        {
          today: '2025-11-26T12:00:00.000Z', // Wednesday
          expected: '2025-11-28T00:00:00.000Z',
          expectedReferenceDateIsWeekday: true,
        },
        {
          today: '2025-11-27T12:00:00.000Z', // Thursday (Thanksgiving)
          expected: '2025-11-28T00:00:00.000Z',
          expectedReferenceDateIsWeekday: false,
        },
        {
          today: '2025-11-28T23:59:59.999Z', // Friday
          expected: '2025-12-01T00:00:00.000Z',
          expectedReferenceDateIsWeekday: true,
        },
        {
          today: '2025-11-29T12:00:00.000Z', // Saturday
          expected: '2025-12-01T00:00:00.000Z', // Monday
          expectedReferenceDateIsWeekday: false,
        },
        {
          today: '2025-11-30T12:00:00.000Z', // Sunday
          expected: '2025-12-01T00:00:00.000Z', // Monday
          expectedReferenceDateIsWeekday: false,
        },
        {
          today: '2025-12-25T12:00:00.000Z', // Christmas
          expected: '2025-12-26T00:00:00.000Z',
          expectedReferenceDateIsWeekday: false,
        },
        {
          today: '2025-12-31T12:00:00.000Z', // Dec 31
          expected: '2026-01-02T00:00:00.000Z',
          expectedReferenceDateIsWeekday: true,
        },
      ]

      tests.forEach(({ today, expected, expectedReferenceDateIsWeekday }) => {
        it(`Should return the first upcoming workday compared to ${today}`, async () => {
          jest.setSystemTime(new Date(today))

          await extensionAction.onEvent({
            payload: generateTestPayload({
              fields: { includeReferenceDate: false },
              settings: {},
            }),
            onComplete,
            onError,
            helpers,
            attempt: 1,
          })

          expect(onComplete).toHaveBeenCalledWith({
            data_points: {
              nextWorkday: expected,
              referenceDateIsWeekday: String(expectedReferenceDateIsWeekday),
            },
          })
        })
      })

      it('Should respect timezone normalization near UTC day boundary (America/Chicago)', async () => {
        // Current time is Tue Nov 25 2025 01:00:00Z
        // In America/Chicago this is Mon Nov 24 evening, so we expect 2025-11-24 as the reference date
        jest.setSystemTime(new Date('2025-11-25T01:00:00.000Z'))

        await extensionAction.onEvent({
          payload: generateTestPayload({
            fields: { timezone: 'America/Chicago' },
            settings: {},
          }),
          onComplete,
          onError,
          helpers,
          attempt: 1,
        })

        expect(onComplete).toHaveBeenCalledWith({
          data_points: {
            nextWorkday: '2025-11-24T00:00:00.000Z',
            referenceDateIsWeekday: 'true',
          },
        })
      })

      it('Should return Tue Nov 25, 2025 when today is Tue Nov 25, 2025 (includeReferenceDate=true)', async () => {
        jest.setSystemTime(new Date('2025-11-25T12:00:00.000Z'))

        await extensionAction.onEvent({
          payload: generateTestPayload({
            fields: {},
            settings: {},
          }),
          onComplete,
          onError,
          helpers,
          attempt: 1,
        })

        expect(onComplete).toHaveBeenCalledWith({
          data_points: {
            nextWorkday: '2025-11-25T00:00:00.000Z',
            referenceDateIsWeekday: 'true',
          },
        })
      })

      it('Should handle explicit -06:00 offset (includeReferenceDate=true)', async () => {
        // 2025-11-25 20:00 in America/Chicago (-06:00) → local day is 2025-11-25
        jest.setSystemTime(new Date('2025-11-25T20:00:00-06:00'))

        await extensionAction.onEvent({
          payload: generateTestPayload({
            fields: { timezone: 'America/Chicago' },
            settings: {},
          }),
          onComplete,
          onError,
          helpers,
          attempt: 1,
        })

        expect(onComplete).toHaveBeenCalledWith({
          data_points: {
            nextWorkday: '2025-11-25T00:00:00.000Z',
            referenceDateIsWeekday: 'true',
          },
        })
      })
    })

    describe('With includeReferenceDate set to false', () => {
      const tests = [
        {
          today: '2025-11-25T12:00:00.000Z', // Tuesday
          expected: '2025-11-25T00:00:00.000Z',
          expectedReferenceDateIsWeekday: true,
        },
        {
          today: '2025-11-27T12:00:00.000Z', // Thursday (Thanksgiving)
          expected: '2025-11-28T00:00:00.000Z',
          expectedReferenceDateIsWeekday: false,
        },
        {
          today: '2025-11-28T12:00:00.000Z', // Friday
          expected: '2025-11-28T00:00:00.000Z',
          expectedReferenceDateIsWeekday: true,
        },
        {
          today: '2025-11-29T12:00:00.000Z', // Saturday
          expected: '2025-12-01T00:00:00.000Z', // Monday
          expectedReferenceDateIsWeekday: false,
        },
        {
          today: '2025-12-24T12:00:00.000Z', // Christmas Eve (holiday)
          expected: '2025-12-26T00:00:00.000Z', // Skip Christmas Eve and Christmas Day
          expectedReferenceDateIsWeekday: false,
        },
        {
          today: '2025-12-31T12:00:00.000Z', // Dec 31
          expected: '2025-12-31T00:00:00.000Z',
          expectedReferenceDateIsWeekday: true,
        },
      ]

      tests.forEach(({ today, expected, expectedReferenceDateIsWeekday }) => {
        it(`Should return the first upcoming workday compared to ${today}`, async () => {
          jest.setSystemTime(new Date(today))

          await extensionAction.onEvent({
            payload: generateTestPayload({
              fields: {},
              settings: {},
            }),
            onComplete,
            onError,
            helpers,
            attempt: 1,
          })

          expect(onComplete).toHaveBeenCalledWith({
            data_points: {
              nextWorkday: expected,
              referenceDateIsWeekday: String(expectedReferenceDateIsWeekday),
            },
          })
        })
      })

      it('On Tue Nov 25, 2025, should return Wed Nov 26, 2025 (includeReferenceDate=false)', async () => {
        jest.setSystemTime(new Date('2025-11-25T12:00:00.000Z'))

        await extensionAction.onEvent({
          payload: generateTestPayload({
            fields: { includeReferenceDate: false },
            settings: {},
          }),
          onComplete,
          onError,
          helpers,
          attempt: 1,
        })

        expect(onComplete).toHaveBeenCalledWith({
          data_points: {
            nextWorkday: '2025-11-26T00:00:00.000Z',
            referenceDateIsWeekday: 'true',
          },
        })
      })

      it('Should handle explicit -06:00 offset (includeReferenceDate=false)', async () => {
        // 2025-11-25 20:00 in America/Chicago (-06:00) → local day is 2025-11-25
        jest.setSystemTime(new Date('2025-11-25T20:00:00-06:00'))

        await extensionAction.onEvent({
          payload: generateTestPayload({
            fields: {
              includeReferenceDate: false,
              timezone: 'America/Chicago',
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
            nextWorkday: '2025-11-26T00:00:00.000Z',
            referenceDateIsWeekday: 'true',
          },
        })
      })
    })
  })

  describe('With reference date', () => {
    it('Should return the next workday from the reference date', async () => {
      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            referenceDate: '2026-01-01T12:30:00.000Z', // New Year's Day (holiday)
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
          nextWorkday: '2026-01-02T00:00:00.000Z',
          referenceDateIsWeekday: 'false',
        },
      })
    })

    it('Dec 31 as reference date with includeReferenceDate=true should return Dec 31', async () => {
      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            referenceDate: '2025-12-31T12:30:00.000Z',
            includeReferenceDate: true,
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
          nextWorkday: '2025-12-31T00:00:00.000Z',
          referenceDateIsWeekday: 'true',
        },
      })
    })

    it('Dec 31 as reference date with includeReferenceDate=false should skip to Jan 2', async () => {
      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            referenceDate: '2025-12-31T12:30:00.000Z',
            includeReferenceDate: false,
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
          nextWorkday: '2026-01-02T00:00:00.000Z',
          referenceDateIsWeekday: 'true',
        },
      })
    })
  })

  describe('Holidays and observed', () => {
    it('Thanksgiving 2025 (Thu Nov 27, 2025) should be skipped', async () => {
      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            referenceDate: '2025-11-27T12:30:00.000Z', // Thursday (US Thanksgiving)
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
          nextWorkday: '2025-11-28T00:00:00.000Z', // Friday after Thanksgiving
          referenceDateIsWeekday: 'false',
        },
      })
    })

    it('Day before Thanksgiving 2025 (Wed Nov 26, 2025) is a workday', async () => {
      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            referenceDate: '2025-11-26T12:30:00.000Z', // Wednesday
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
          nextWorkday: '2025-11-26T00:00:00.000Z',
          referenceDateIsWeekday: 'true',
        },
      })
    })

    it('Christmas Eve 2025 (Wed Dec 24, 2025) should be skipped as a holiday', async () => {
      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            referenceDate: '2025-12-24T12:30:00.000Z', // Christmas Eve (Wednesday)
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
          nextWorkday: '2025-12-26T00:00:00.000Z', // Friday after Christmas
          referenceDateIsWeekday: 'false',
        },
      })
    })

    it('Christmas Eve 2027 (Fri Dec 24, 2027) should skip to Monday Dec 27', async () => {
      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            referenceDate: '2027-12-24T12:30:00.000Z', // Christmas Eve (Friday)
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
          nextWorkday: '2027-12-27T00:00:00.000Z', // Monday after Christmas weekend
          referenceDateIsWeekday: 'false',
        },
      })
    })

    it('Observed holiday on Friday when Independence Day (2026-07-04) falls on Saturday should skip to Monday', async () => {
      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            referenceDate: '2026-07-03T12:30:00.000Z', // Observed Independence Day (Friday)
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
          nextWorkday: '2026-07-06T00:00:00.000Z', // Monday
          referenceDateIsWeekday: 'false',
        },
      })
    })
  })
})
