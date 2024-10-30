import { serializeJson } from '.'
import { generateTestPayload } from '@/tests'

describe('Transform - Serialize JSON', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should serialize a JSON object to a string', async () => {
    const object = {
      hello: 'world',
    }

    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        json: JSON.stringify(object),
      },
      settings: {},
    })

    await serializeJson.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        serializedJson: JSON.stringify(object),
      },
    })
  })
})
