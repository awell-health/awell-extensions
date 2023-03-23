import { randomNumber, type RandomNumberActivityPayload } from '..'

describe('Math - random-integer', () => {
  test('Should call onComplete', async () => {
    const onComplete = jest.fn()
    const onError = jest.fn()
    const mockOnActivityCreateParams: RandomNumberActivityPayload = {
      activity: { id: 'test-activity' },
      patient: { id: 'test-patient' },
      fields: {
        min: '15',
        max: '30',
      },
      settings: {},
    }
    await randomNumber.onActivityCreated(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )
    expect(onComplete).toHaveBeenCalled()
  })
  test('Should call onError if fields.min is undefined', async () => {
    const onComplete = jest.fn()
    const onError = jest.fn()
    const mockOnActivityCreateParams: RandomNumberActivityPayload = {
      activity: { id: 'test-activity' },
      patient: { id: 'test-patient' },
      fields: {
        min: undefined,
        max: '30',
      },
      settings: {},
    }
    await randomNumber.onActivityCreated(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )
    expect(onError).toHaveBeenCalled()
  })
  test('Should call onError if fields.max is undefined', async () => {
    const onComplete = jest.fn()
    const onError = jest.fn()
    const mockOnActivityCreateParams: RandomNumberActivityPayload = {
      activity: { id: 'test-activity' },
      patient: { id: 'test-patient' },
      fields: {
        min: '15',
        max: undefined,
      },
      settings: {},
    }
    await randomNumber.onActivityCreated(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )
    expect(onError).toHaveBeenCalled()
  })
  test('Check for difference between min and max', async () => {
    const onComplete = jest.fn()
    const onError = jest.fn()
    const mockOnActivityCreateParams: RandomNumberActivityPayload = {
      activity: { id: 'test-activity' },
      patient: { id: 'test-patient' },
      fields: {
        min: '42',
        max: '42',
      },
      settings: {},
    }
    await randomNumber.onActivityCreated(
      mockOnActivityCreateParams,
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
