import { TestHelpers } from '@awell-health/extensions-core'
import { getNextWorkday } from './getNextWorkday'
import { generateTestPayload } from '../../../../tests/constants'

describe('Date Helpers - getNextWorkday', () => {
  const { extensionAction, onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(getNextWorkday)

  beforeAll(() => {
    jest.useFakeTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  const tests = [
    {
      today: '2025-04-14T12:30:00.000Z', // Monday
      expected: '2025-04-14T00:00:00.000Z', // Return Monday as it's a workday
    },
    {
      today: '2025-04-15T22:00:00.000Z', // Tuesday
      expected: '2025-04-15T00:00:00.000Z', // Return Tuesday as it's a workday
    },
    {
      today: '2025-04-16T00:00:00.000Z', // Wednesday
      expected: '2025-04-16T00:00:00.000Z', // Return Wednesday as it's a workday
    },
    {
      today: '2025-04-17T00:00:00.000Z', // Thursday
      expected: '2025-04-17T00:00:00.000Z', // Return Thursday as it's a workday
    },
    {
      today: '2025-04-18T23:59:59.999Z', // Friday
      expected: '2025-04-18T00:00:00.000Z', // Return Friday as it's a workday
    },
    {
      today: '2025-04-19T00:00:00.000Z', // Saturday
      expected: '2025-04-21T00:00:00.000Z', // Monday
    },
    {
      today: '2025-04-20T00:00:00.000Z', // Sunday
      expected: '2025-04-21T00:00:00.000Z', // Monday
    },
  ]

  tests.forEach(({ today, expected }) => {
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
      })

      expect(onComplete).toHaveBeenCalledWith({
        data_points: {
          nextWorkday: expected,
        },
      })
    })
  })
})
