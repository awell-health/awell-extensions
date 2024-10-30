import { parseStringToPhoneNumber } from '.'
import { generateTestPayload } from '@/tests'

describe('Transform - Parse text to phone number', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should work', async () => {
    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        text: '+14155556786',
      },
      settings: {},
    })

    await parseStringToPhoneNumber.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        phoneNumber: '+14155556786',
      },
    })
  })
})
