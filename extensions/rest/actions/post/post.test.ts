import { TestHelpers } from '@awell-health/extensions-core'
import { post } from '.'
import { generateTestPayload } from '@/tests'

describe('REST - POST', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(post)

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(global, 'fetch')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('Should work with JSON response', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      statusText: 'Ok',
      ok: true,
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      text: jest.fn().mockResolvedValue(
        JSON.stringify({
          success: true,
          message: 'Data received successfully',
        })
      ),
    } satisfies Partial<Response>)

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

    await extensionAction.onEvent({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
    })

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

  test('Should work with non)JSON response', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      statusText: 'Ok',
      ok: true,
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      text: jest.fn().mockResolvedValue(undefined),
    } satisfies Partial<Response>)

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

    await extensionAction.onEvent({
      payload: mockOnActivityCreateParams,
      onComplete,
      onError,
      helpers,
    })

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
        response: 'No content',
        statusCode: '200',
      },
    })
  })

  test('Should catch errors', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      status: 404,
      ok: false,
      statusText: 'Not found',
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      text: jest.fn().mockResolvedValue(
        JSON.stringify({
          message: 'Not found',
        })
      ),
    } satisfies Partial<Response>)

    const mockOnActivityCreateParams = generateTestPayload({
      fields: {
        endpoint: 'https://webhook.site/bb853fec-9260-44e5-a944-17894d678a7f',
        headers: '{}',
        jsonPayload: `{}`,
        additionalPayload: `{}`,
      },
      settings: {},
    })

    await post.onActivityCreated!(
      mockOnActivityCreateParams,
      onComplete,
      onError
    )

    expect(global.fetch).toHaveBeenCalledWith(
      'https://webhook.site/bb853fec-9260-44e5-a944-17894d678a7f',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })
    )

    expect(onError).toHaveBeenCalledWith({
      events: [
        expect.objectContaining({
          error: {
            category: 'SERVER_ERROR',
            message: '404 Not found ',
          },
          text: {
            en: '404 Not found ',
          },
        }),
      ],
    })
  })
})
