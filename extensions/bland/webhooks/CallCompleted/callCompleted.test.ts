import { createHmac } from 'crypto'
import { TestHelpers } from '@awell-health/extensions-core'
import { callCompleted as webhook } from '.'
import { callCompletedPayload } from './__testdata__/callCompleted.mock'

describe('Webhook - Call completed', () => {
  const { extensionWebhook, onSuccess, onError, helpers, clearMocks } =
    TestHelpers.fromWebhook(webhook)

  beforeEach(() => {
    clearMocks()
  })

  describe('When call_id is missing', () => {
    test('Should call onError and not call onSuccess', async () => {
      const { call_id, ...payloadWithoutCallId } = callCompletedPayload

      await extensionWebhook.onEvent!({
        payload: {
          payload: payloadWithoutCallId as any,
          settings: { apiKey: 'api-key' },
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(onError).toHaveBeenCalledWith({
        response: {
          statusCode: 400,
          message: 'Missing call_id in payload',
        },
      })
      expect(onSuccess).not.toHaveBeenCalled()
    })
  })

  describe('When payload is valid', () => {
    test('Should call onSuccess, which starts the care flow', async () => {
      await extensionWebhook.onEvent!({
        payload: {
          payload: callCompletedPayload,
          settings: {
            apiKey: 'api-key',
          },
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(onSuccess).toHaveBeenCalledWith({
        data_points: {
          callId: callCompletedPayload.call_id,
          completed: callCompletedPayload.completed.toString(),
          status: callCompletedPayload.status,
          answeredBy: callCompletedPayload.answered_by ?? '',
          errorMessage: callCompletedPayload.error_message ?? '',
          callObject: JSON.stringify(callCompletedPayload),
        },
        patient_id: callCompletedPayload.variables?.metadata?.awell_patient_id,
      })
    })
  })
})

describe('webhook - signing secret', () => {
  const { extensionWebhook, onSuccess, onError, helpers, clearMocks } =
    TestHelpers.fromWebhook(webhook)

  const SECRET = 'whsec_test_secret'
  const body = callCompletedPayload
  const rawBody = Buffer.from(JSON.stringify(body))
  const signed = createHmac('sha256', SECRET).update(rawBody).digest('hex')

  const receive = async (
    headers: Record<string, string>,
    signingSecret: string | null = SECRET,
  ): Promise<void> => {
    await extensionWebhook.onEvent!({
      payload: {
        payload: body as any,
        rawBody,
        headers,
        settings: { apiKey: 'api-key', signingSecret: signingSecret ?? undefined },
      } as any,
      onSuccess,
      onError,
      helpers,
    })
  }

  beforeEach(() => {
    clearMocks()
  })

  test('Should accept a request signed with the secret', async () => {
    await receive({ 'x-webhook-signature': signed })

    expect(onError).not.toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  test('Should refuse an unsigned request with a 401 and start nothing', async () => {
    await receive({})

    expect(onSuccess).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith({
      response: {
        statusCode: 401,
        message: 'Invalid or missing X-Webhook-Signature header',
      },
    })
  })

  test('Should refuse a request signed with another secret', async () => {
    const forged = createHmac('sha256', 'other').update(rawBody).digest('hex')

    await receive({ 'x-webhook-signature': forged })

    expect(onSuccess).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        response: expect.objectContaining({ statusCode: 401 }),
      }),
    )
  })

  test.each([
    ['undefined', null],
    ['an empty string', ''],
  ])(
    'Should not check the signature, and change nothing, when the secret is %s',
    async (_name, signingSecret) => {
      await receive({}, signingSecret)

      expect(onError).not.toHaveBeenCalled()
      expect(onSuccess).toHaveBeenCalledTimes(1)
    },
  )
})

