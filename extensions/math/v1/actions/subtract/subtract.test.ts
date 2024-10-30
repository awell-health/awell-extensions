import { ZodError } from 'zod'
import { generateTestPayload } from '@/tests'
import { subtract } from './subtract'

describe('Subtract', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should work', async () => {
    await subtract.onActivityCreated!(
      generateTestPayload({
        fields: {
          minuend: 5,
          subtrahend: 10,
        },
        settings: {},
      }),
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        difference: '-5',
        absoluteDifference: '5',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should return an error if action fields are undefined', async () => {
    await expect(
      subtract.onActivityCreated!(
        generateTestPayload({
          fields: {
            minuend: undefined,
            subtrahend: undefined,
          },
          settings: {},
        }),
        onComplete,
        onError
      )
    ).rejects.toThrow(ZodError)
  })
})
