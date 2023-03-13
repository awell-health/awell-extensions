import { randomInteger } from '../'

describe('Math - random-integer', () => {
  test('Should call onComplete', async () => {
    const onComplete = jest.fn()
    const onError = jest.fn()
    await randomInteger.onActivityCreated(
      {
        activity: { id: 'test-activity' },
        patient: { id: 'test-patient' },
        fields: {
          low: '15',
          high: '30',
        },
        settings: {},
      },
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalled()
  })
  test('Should call onError if fields.low is undefined', async () => {
    const onComplete = jest.fn()
    const onError = jest.fn()
    await randomInteger.onActivityCreated(
      {
        activity: { id: 'test-activity' },
        patient: { id: 'test-patient' },
        fields: {
          low: undefined,
          high: '30',
        },
        settings: {},
      },
      onComplete,
      onError
    )
    expect(onError).toHaveBeenCalled()
  })
  test('Should call onError if fields.high is undefined', async () => {
    const onComplete = jest.fn()
    const onError = jest.fn()
    await randomInteger.onActivityCreated(
      {
        activity: { id: 'test-activity' },
        patient: { id: 'test-patient' },
        fields: {
          low: '15',
          high: undefined,
        },
        settings: {},
      },
      onComplete,
      onError
    )
    expect(onError).toHaveBeenCalled()
  })
  test('Check for difference between min and max', async () => {
    const onComplete = jest.fn()
    const onError = jest.fn()
    await randomInteger.onActivityCreated(
      {
        activity: { id: 'test-activity' },
        patient: { id: 'test-patient' },
        fields: {
          low: '42',
          high: '42',
        },
        settings: {},
      },
      onComplete,
      onError
    )
    expect(onComplete).toBeCalledWith({
      data_points: {
        generated_number: '42',
      },
    })
  })
})
