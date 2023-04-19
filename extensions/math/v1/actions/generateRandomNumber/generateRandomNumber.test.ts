import { generateRandomNumber } from './generateRandomNumber'

describe('Generate random number', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should call onComplete', async () => {
    const mockOnActivityCreateParams = {
      pathway: {
        id: 'pathway-id',
        definition_id: 'pathway-definition-id',
      },
      activity: { id: 'test-activity' },
      patient: { id: 'test-patient' },
      fields: {
        min: 15,
        max: 30,
      },
      settings: {},
    }

    await generateRandomNumber.onActivityCreated(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalled()
  })
  test('Should call onError if fields.min is undefined', async () => {
    const mockOnActivityCreateParams = {
      pathway: {
        id: 'pathway-id',
        definition_id: 'pathway-definition-id',
      },
      activity: { id: 'test-activity' },
      patient: { id: 'test-patient' },
      fields: {
        min: undefined,
        max: 30,
      },
      settings: {},
    }

    await generateRandomNumber.onActivityCreated(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onError).toHaveBeenCalled()
  })
  test('Should call onError if fields.max is undefined', async () => {
    const mockOnActivityCreateParams = {
      pathway: {
        id: 'pathway-id',
        definition_id: 'pathway-definition-id',
      },
      activity: { id: 'test-activity' },
      patient: { id: 'test-patient' },
      fields: {
        min: 15,
        max: undefined,
      },
      settings: {},
    }

    await generateRandomNumber.onActivityCreated(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onError).toHaveBeenCalled()
  })
  test('Check for difference between min and max', async () => {
    const mockOnActivityCreateParams = {
      pathway: {
        id: 'pathway-id',
        definition_id: 'pathway-definition-id',
      },
      activity: { id: 'test-activity' },
      patient: { id: 'test-patient' },
      fields: {
        min: 42,
        max: 42,
      },
      settings: {},
    }

    await generateRandomNumber.onActivityCreated(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toBeCalledWith({
      data_points: {
        generatedNumber: '42',
      },
    })
  })
})
