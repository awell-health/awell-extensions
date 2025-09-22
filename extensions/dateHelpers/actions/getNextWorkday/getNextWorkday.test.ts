import { TestHelpers } from '@awell-health/extensions-core'
import { getNextWorkday } from './getNextWorkday'
import { generateTestPayload } from '../../../../tests/constants'

describe('Date Helpers - getNextWorkday', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(getNextWorkday)

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
          today: '2025-04-14T12:30:00.000Z', // Monday
          expected: '2025-04-14T00:00:00.000Z', // Return Monday as it's a workday
          expectedReferenceDateIsWeekday: true,
        },
        {
          today: '2025-04-15T22:00:00.000Z', // Tuesday
          expected: '2025-04-15T00:00:00.000Z', // Return Tuesday as it's a workday
          expectedReferenceDateIsWeekday: true,
        },
        {
          today: '2025-04-16T00:00:00.000Z', // Wednesday
          expected: '2025-04-16T00:00:00.000Z', // Return Wednesday as it's a workday
          expectedReferenceDateIsWeekday: true,
        },
        {
          today: '2025-04-17T00:00:00.000Z', // Thursday
          expected: '2025-04-17T00:00:00.000Z', // Return Thursday as it's a workday
          expectedReferenceDateIsWeekday: true,
        },
        {
          today: '2025-04-18T23:59:59.999Z', // Friday
          expected: '2025-04-18T00:00:00.000Z', // Return Friday as it's a workday
          expectedReferenceDateIsWeekday: true,
        },
        {
          today: '2025-04-19T00:00:00.000Z', // Saturday
          expected: '2025-04-21T00:00:00.000Z', // Monday
          expectedReferenceDateIsWeekday: false,
        },
        {
          today: '2025-04-20T00:00:00.000Z', // Sunday
          expected: '2025-04-21T00:00:00.000Z', // Monday
          expectedReferenceDateIsWeekday: false,
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
    })

    describe('With includeReferenceDate set to false', () => {
      const tests = [
        {
          today: '2025-04-14T12:30:00.000Z', // Monday
          expected: '2025-04-15T00:00:00.000Z', // Tuesday is the next workday
          expectedReferenceDateIsWeekday: true,
        },
        {
          today: '2025-04-15T22:00:00.000Z', // Tuesday
          expected: '2025-04-16T00:00:00.000Z', // Wednesday is the next workday
          expectedReferenceDateIsWeekday: true,
        },
        {
          today: '2025-04-16T00:00:00.000Z', // Wednesday
          expected: '2025-04-17T00:00:00.000Z', // Thursday is the next workday
          expectedReferenceDateIsWeekday: true,
        },
        {
          today: '2025-04-17T00:00:00.000Z', // Thursday
          expected: '2025-04-18T00:00:00.000Z', // Friday is the next workday
          expectedReferenceDateIsWeekday: true,
        },
        {
          today: '2025-04-18T23:59:59.999Z', // Friday
          expected: '2025-04-21T00:00:00.000Z', // Monday is the next workday
          expectedReferenceDateIsWeekday: false,
        },
        {
          today: '2025-04-19T00:00:00.000Z', // Saturday
          expected: '2025-04-21T00:00:00.000Z', // Monday
          expectedReferenceDateIsWeekday: false,
        },
        {
          today: '2025-04-20T00:00:00.000Z', // Sunday
          expected: '2025-04-21T00:00:00.000Z', // Monday is the next workday
          expectedReferenceDateIsWeekday: false,
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
    })
  })

  describe('With reference date', () => {
    it('Should return the next workday from the reference date', async () => {
      await extensionAction.onEvent({
        payload: generateTestPayload({
          fields: {
            referenceDate: '2025-01-01T12:30:00.000Z', // Wednesday
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
          nextWorkday: '2025-01-01T00:00:00.000Z',
          referenceDateIsWeekday: 'true',
        },
      })
    })
  })
})
