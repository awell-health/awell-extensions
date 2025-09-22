import { TestHelpers } from '@awell-health/extensions-core'
import { generateTestPayload } from '@/tests'
import { createNaviSession } from '.'

describe('Create Navi Session', () => {
  const { onComplete, onError, helpers, extensionAction, clearMocks } =
    TestHelpers.fromAction(createNaviSession)

  beforeEach(() => {
    clearMocks()
    jest.clearAllMocks()
    jest.spyOn(global, 'fetch')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('Should POST and return sessionId', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      ok: true,
      statusText: 'OK',
      json: jest.fn().mockResolvedValue({ session_id: 'abc' }),
    } satisfies Partial<Response>)

    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: {
          stakeholderId: 'patient',
          exp: String(1755000000),
        },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(global.fetch).toHaveBeenCalledWith(
      'https://navi-portal.awellhealth.com/api/session/create',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.any(String),
      }),
    )
    expect(onComplete).toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })

  test('Should handle non-200', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      status: 500,
      ok: false,
      statusText: 'Internal Server Error',
      text: jest.fn().mockResolvedValue('boom'),
    } satisfies Partial<Response>)

    await extensionAction.onEvent({
      payload: generateTestPayload({
        fields: { careFlowId: 'c1' },
        settings: {},
      }),
      onComplete,
      onError,
      helpers,
      attempt: 1,
    })

    expect(onError).toHaveBeenCalled()
  })
})
