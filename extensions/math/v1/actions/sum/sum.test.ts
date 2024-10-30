import { ZodError } from 'zod'
import { generateTestPayload } from '@/tests'
import { sum } from './sum'

describe('Sum', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should work', async () => {
    await sum.onActivityCreated!(
      generateTestPayload({
        fields: {
          addend_01: 1,
          addend_02: 2,
          addend_03: 5,
          addend_04: undefined,
          addend_05: undefined,
          addend_06: undefined,
          addend_07: 10,
          addend_08: undefined,
          addend_09: undefined,
          addend_10: undefined,
          addend_11: undefined,
          addend_12: undefined,
          addend_13: undefined,
          addend_14: undefined,
          addend_15: undefined,
          addend_16: undefined,
          addend_17: undefined,
          addend_18: undefined,
          addend_19: undefined,
          addend_20: undefined,
        },
        settings: {},
      }),
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        sum: '18',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should return an error if all addends are undefined', async () => {
    await expect(
      sum.onActivityCreated!(
        generateTestPayload({
          fields: {
            addend_01: undefined,
            addend_02: undefined,
            addend_03: undefined,
            addend_04: undefined,
            addend_05: undefined,
            addend_06: undefined,
            addend_07: undefined,
            addend_08: undefined,
            addend_09: undefined,
            addend_10: undefined,
            addend_11: undefined,
            addend_12: undefined,
            addend_13: undefined,
            addend_14: undefined,
            addend_15: undefined,
            addend_16: undefined,
            addend_17: undefined,
            addend_18: undefined,
            addend_19: undefined,
            addend_20: undefined,
          },
          settings: {},
        }),
        onComplete,
        onError
      )
    ).rejects.toThrow(ZodError)
  })
})
