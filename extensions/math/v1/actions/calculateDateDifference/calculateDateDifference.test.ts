import { generateTestPayload } from '@/tests'
import { calculateDateDifference } from './calculateDateDifference'

describe('Calculate date difference', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Date difference in seconds', async () => {
    await calculateDateDifference.onActivityCreated!(
      generateTestPayload({
        fields: {
          dateLeft: '2023-04-08T10:00:00',
          dateRight: '2023-04-08T09:59:55',
          unit: 'seconds',
        },
        settings: {},
      }),
      onComplete,
      onError
    )

    expect(onComplete).toBeCalledWith({
      data_points: {
        dateDifference: '5',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Date difference in minutes', async () => {
    await calculateDateDifference.onActivityCreated!(
      generateTestPayload({
        fields: {
          dateLeft: '2023-04-08T10:00:00',
          dateRight: '2023-04-08T09:50:00',
          unit: 'minutes',
        },
        settings: {},
      }),
      onComplete,
      onError
    )

    expect(onComplete).toBeCalledWith({
      data_points: {
        dateDifference: '10',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Date difference in hours', async () => {
    await calculateDateDifference.onActivityCreated!(
      generateTestPayload({
        fields: {
          dateLeft: '2023-04-08T10:00:00',
          dateRight: '2023-04-08T09:00:00',
          unit: 'hours',
        },
        settings: {},
      }),
      onComplete,
      onError
    )

    expect(onComplete).toBeCalledWith({
      data_points: {
        dateDifference: '1',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Date difference in days', async () => {
    await calculateDateDifference.onActivityCreated!(
      generateTestPayload({
        fields: {
          dateLeft: '2023-04-18T10:00:00',
          dateRight: '2023-04-08T10:00:00',
          unit: 'days',
        },
        settings: {},
      }),
      onComplete,
      onError
    )

    expect(onComplete).toBeCalledWith({
      data_points: {
        dateDifference: '10',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Date difference in weeks', async () => {
    await calculateDateDifference.onActivityCreated!(
      generateTestPayload({
        fields: {
          dateLeft: '2014-07-20T00:00:00',
          dateRight: '2014-07-05T00:00:00',
          unit: 'weeks',
        },
        settings: {},
      }),
      onComplete,
      onError
    )

    expect(onComplete).toBeCalledWith({
      data_points: {
        dateDifference: '2',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Date difference in months', async () => {
    await calculateDateDifference.onActivityCreated!(
      generateTestPayload({
        fields: {
          dateLeft: '2023-09-01T00:00:00',
          dateRight: '2023-01-31T00:00:00',
          unit: 'months',
        },
        settings: {},
      }),
      onComplete,
      onError
    )

    expect(onComplete).toBeCalledWith({
      data_points: {
        dateDifference: '7',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Date difference in years', async () => {
    await calculateDateDifference.onActivityCreated!(
      generateTestPayload({
        fields: {
          dateLeft: '2025-02-11T00:00:00',
          dateRight: '2023-12-31T00:00:00',
          unit: 'years',
        },
        settings: {},
      }),
      onComplete,
      onError
    )

    expect(onComplete).toBeCalledWith({
      data_points: {
        dateDifference: '1',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Date difference in non-supported unit should throw an error', async () => {
    await calculateDateDifference.onActivityCreated!(
      generateTestPayload({
        fields: {
          dateLeft: '2025-02-11T00:00:00',
          dateRight: '2023-12-31T00:00:00',
          unit: 'apples',
        },
        settings: {},
      }),
      onComplete,
      onError
    )

    expect(onComplete).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()
  })
})
