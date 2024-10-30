import { ZodError } from 'zod'
import { generateTestPayload } from '@/tests'
import { multiply } from './multiply'

describe('Multiply', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should work', async () => {
    await multiply.onActivityCreated!(
      generateTestPayload({
        fields: {
          factor_01: 1,
          factor_02: 2,
          factor_03: 5,
          factor_04: undefined,
          factor_05: undefined,
          factor_06: undefined,
          factor_07: 10,
          factor_08: undefined,
          factor_09: undefined,
          factor_10: undefined,
          factor_11: undefined,
          factor_12: undefined,
          factor_13: undefined,
          factor_14: undefined,
          factor_15: undefined,
          factor_16: undefined,
          factor_17: undefined,
          factor_18: undefined,
          factor_19: undefined,
          factor_20: undefined,
        },
        settings: {},
      }),
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        product: '100',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should return an error if all addends are undefined', async () => {
    await expect(
      multiply.onActivityCreated!(
        generateTestPayload({
          fields: {
            factor_01: undefined,
            factor_02: undefined,
            factor_03: undefined,
            factor_04: undefined,
            factor_05: undefined,
            factor_06: undefined,
            factor_07: undefined,
            factor_08: undefined,
            factor_09: undefined,
            factor_10: undefined,
            factor_11: undefined,
            factor_12: undefined,
            factor_13: undefined,
            factor_14: undefined,
            factor_15: undefined,
            factor_16: undefined,
            factor_17: undefined,
            factor_18: undefined,
            factor_19: undefined,
            factor_20: undefined,
          },
          settings: {},
        }),
        onComplete,
        onError
      )
    ).rejects.toThrow(ZodError)
  })
})
