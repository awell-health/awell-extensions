import { ZodError } from 'zod'
import { generateTestPayload } from '@/tests'
import { divide } from './divide'

describe('Divide', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    onComplete.mockClear()
    onError.mockClear()
  })

  test('Should work', async () => {
    await divide.onActivityCreated!(
      generateTestPayload({
        fields: {
          dividend: 10,
          divisor: 5,
        },
        settings: {},
      }),
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        quotient: '2',
      },
    })
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should return an error if action fields are undefined', async () => {
    await expect(
      divide.onActivityCreated!(
        generateTestPayload({
          fields: {
            dividend: undefined,
            divisor: undefined,
          },
          settings: {},
        }),
        onComplete,
        onError
      )
    ).rejects.toThrow(ZodError)
  })
})
