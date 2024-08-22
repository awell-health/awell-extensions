import { post } from '.'
import { generateTestPayload } from '../../../../src/tests'

describe('REST - POST', () => {
  const onComplete = jest.fn()
  const onError = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(global, 'fetch')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('Should work', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue({
        success: true,
        message: 'Data received successfully',
      }),
    })

    const jsonPayload = {
      'key-1': 'value',
    }
    const additionalPayload = {
      'key-2': 'value',
    }

    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        endpoint: 'https://webhook.site/bb853fec-9260-44e5-a944-17894d678a7f',
        headers: JSON.stringify({
          Authorization: 'Bearer key',
        }),
        jsonPayload: JSON.stringify(jsonPayload),
        additionalPayload: JSON.stringify(additionalPayload),
      },
      settings: {},
    })

    await post.onActivityCreated(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(global.fetch).toHaveBeenCalledWith(
      'https://webhook.site/bb853fec-9260-44e5-a944-17894d678a7f',
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: 'Bearer key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...jsonPayload,
          ...additionalPayload,
        }),
      })
    )

    expect(onComplete).toHaveBeenCalledWith({
      data_points: {
        response: '{"success":true,"message":"Data received successfully"}',
        statusCode: '200',
      },
    })
  })
})
