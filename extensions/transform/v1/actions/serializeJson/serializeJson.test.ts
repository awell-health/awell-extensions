import { serializeJson } from '.'
import { generateTestPayload } from '@/tests'
import { TestHelpers } from '@awell-health/extensions-core'

describe('Transform - Serialize JSON', () => {
  const { onComplete, onError, helpers, clearMocks } =
    TestHelpers.fromAction(serializeJson)

  beforeEach(() => {
    clearMocks()
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

    await serializeJson.onEvent!({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        serializedJson: JSON.stringify(object),
      },
    })
  })
})
