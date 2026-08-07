import crypto from 'crypto'
import { TestHelpers } from '@awell-health/extensions-core'
import { shouldDedupe } from '../shared/shouldDedupe'
import {
  realtimeUpdate as webhook,
  METRIPORT_PATIENT_IDENTIFIER_SYSTEM,
} from './realtimeUpdate'
import { MetriportWebhookType } from './types'

jest.mock('../shared/shouldDedupe', () => ({
  shouldDedupe: jest.fn().mockReturnValue(false),
}))

const mockedShouldDedupe = jest.mocked(shouldDedupe)

const sign = (key: string, body: string): string =>
  crypto.createHmac('sha256', key).update(body).digest('hex')

const mockSettings = {
  apiKey: 'test-api-key',
  baseUrl: '',
  webhookKey: '',
}

const notification = (
  type: MetriportWebhookType,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> => ({
  meta: {
    messageId: 'msg-1',
    when: '2026-07-21T10:00:00.000Z',
    type,
  },
  payload: {
    url: 'https://example.com/encounter-bundle',
    patientId: 'patient-123',
    externalId: 'external-abc',
    ...overrides,
  },
})

const admitPayload = notification(MetriportWebhookType.PatientAdmit)

describe('Metriport - Webhook - Realtime Update', () => {
  const { extensionWebhook, onSuccess, onError, helpers, clearMocks } =
    TestHelpers.fromWebhook(webhook)

  beforeEach(() => {
    clearMocks()
    // Deduping is production-only; default to off so the other suites don't
    // construct a rate limiter.
    mockedShouldDedupe.mockReturnValue(false)
  })

  const invoke = async (payload: unknown, headers = {}): Promise<void> => {
    await extensionWebhook.onEvent({
      payload: {
        payload,
        settings: mockSettings,
        rawBody: Buffer.from(''),
        headers,
      },
      onSuccess,
      onError,
      helpers,
    })
  }

  describe('When an ADT notification is received', () => {
    test.each([
      MetriportWebhookType.PatientAdmit,
      MetriportWebhookType.PatientDischarge,
      MetriportWebhookType.PatientTransfer,
      MetriportWebhookType.DischargeSummary,
    ])('Should enroll the patient for %s', async (type) => {
      await invoke(notification(type))

      expect(onError).not.toHaveBeenCalled()
      expect(onSuccess).toHaveBeenCalledWith({
        data_points: {
          eventType: type,
          metriportPatientId: 'patient-123',
          externalId: 'external-abc',
          when: '2026-07-21T10:00:00.000Z',
          messageId: 'msg-1',
          bundleUrl: 'https://example.com/encounter-bundle',
        },
        patient_identifier: {
          system: METRIPORT_PATIENT_IDENTIFIER_SYSTEM,
          value: 'patient-123',
        },
      })
    })

    test('Should emit an empty externalId when Metriport does not send one', async () => {
      await invoke({
        meta: {
          messageId: 'msg-2',
          when: '2026-07-22T10:00:00.000Z',
          type: MetriportWebhookType.DischargeSummary,
        },
        payload: {
          url: 'https://example.com/discharge-summary',
          patientId: 'patient-789',
        },
      })

      expect(onError).not.toHaveBeenCalled()
      const call = onSuccess.mock.calls[0][0]
      expect(call.data_points.externalId).toBe('')
      expect(call.data_points.metriportPatientId).toBe('patient-789')
    })
  })

  describe('When values contain surrounding whitespace', () => {
    test('Should trim strings before emitting data points', async () => {
      await invoke({
        meta: {
          messageId: '  msg-1  ',
          when: '2026-07-21T10:00:00.000Z',
          type: MetriportWebhookType.PatientAdmit,
        },
        payload: {
          url: '  https://example.com/encounter-bundle  ',
          patientId: '  patient-123  ',
          externalId: '  external-abc  ',
        },
      })

      expect(onError).not.toHaveBeenCalled()
      const call = onSuccess.mock.calls[0][0]
      expect(call.data_points.metriportPatientId).toBe('patient-123')
      expect(call.data_points.externalId).toBe('external-abc')
      expect(call.data_points.messageId).toBe('msg-1')
      expect(call.data_points.bundleUrl).toBe(
        'https://example.com/encounter-bundle',
      )
      expect(call.patient_identifier.value).toBe('patient-123')
    })
  })

  describe('When a ping event is received', () => {
    test('Should acknowledge with 200 and not enroll', async () => {
      await invoke({
        meta: {
          messageId: 'msg-ping',
          when: '2026-07-21T10:00:00.000Z',
          type: MetriportWebhookType.Ping,
        },
        ping: 'test-ping-value',
      })

      expect(onSuccess).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith({
        response: {
          statusCode: 200,
          message: 'pong: test-ping-value',
        },
      })
    })
  })

  describe('When a notification type we do not handle is received', () => {
    test('Should acknowledge an undocumented medical.* event with 200 and not enroll', async () => {
      await invoke({
        meta: {
          messageId: 'msg-doc',
          when: '2026-07-21T10:00:00.000Z',
          type: 'medical.document-download',
        },
        patients: [{ patientId: 'patient-123', status: 'completed' }],
      })

      expect(onSuccess).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith({
        response: {
          statusCode: 200,
          message: 'Ignoring unhandled event type: medical.document-download',
        },
      })
    })

    test('Should acknowledge an unknown type carrying no payload at all', async () => {
      await invoke({
        meta: {
          messageId: 'msg-unknown',
          when: '2026-07-21T10:00:00.000Z',
          type: 'something.entirely.new',
        },
      })

      expect(onSuccess).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith({
        response: {
          statusCode: 200,
          message: 'Ignoring unhandled event type: something.entirely.new',
        },
      })
    })
  })

  describe('When a handled notification is malformed', () => {
    test('Should error rather than silently acknowledging a missing payload', async () => {
      await invoke({
        meta: {
          messageId: 'msg-bad',
          when: '2026-07-21T10:00:00.000Z',
          type: MetriportWebhookType.PatientAdmit,
        },
      })

      expect(onSuccess).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError.mock.calls[0][0].response).toBeUndefined()
    })

    test('Should error when the bundle URL is not a URL', async () => {
      await invoke(
        notification(MetriportWebhookType.PatientAdmit, { url: 'not-a-url' }),
      )

      expect(onSuccess).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledTimes(1)
    })

    test('Should error when the patient id is empty', async () => {
      await invoke(
        notification(MetriportWebhookType.PatientAdmit, { patientId: '   ' }),
      )

      expect(onSuccess).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledTimes(1)
    })
  })

  describe('When the envelope itself is unreadable', () => {
    test('Should call onError when meta is incomplete', async () => {
      await invoke({ meta: { type: 'not-a-real-type' } })

      expect(onSuccess).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError.mock.calls[0][0].response).toBeUndefined()
    })
  })

  describe('When a webhook key is configured (HMAC signature verification)', () => {
    const rawBody = Buffer.from(JSON.stringify(admitPayload))

    test('Should reject requests with a missing signature header', async () => {
      await extensionWebhook.onEvent({
        payload: {
          payload: admitPayload,
          settings: { ...mockSettings, webhookKey: 'secret' },
          rawBody,
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(onSuccess).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith({
        response: {
          statusCode: 401,
          message: 'Invalid or missing x-metriport-signature header',
        },
      })
    })

    test('Should reject requests with an invalid signature', async () => {
      await extensionWebhook.onEvent({
        payload: {
          payload: admitPayload,
          settings: { ...mockSettings, webhookKey: 'secret' },
          rawBody,
          headers: {
            'x-metriport-signature': sign('wrong-key', rawBody.toString()),
          },
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(onSuccess).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith({
        response: {
          statusCode: 401,
          message: 'Invalid or missing x-metriport-signature header',
        },
      })
    })

    test('Should accept requests with a valid HMAC-SHA256 signature over the raw body', async () => {
      await extensionWebhook.onEvent({
        payload: {
          payload: admitPayload,
          settings: { ...mockSettings, webhookKey: 'secret' },
          rawBody,
          headers: {
            'x-metriport-signature': sign('secret', rawBody.toString()),
          },
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(onError).not.toHaveBeenCalled()
      expect(onSuccess).toHaveBeenCalledTimes(1)
    })
  })

  describe('When rate limiting is configured', () => {
    const settingsWithRateLimit = { ...mockSettings, rateLimitDuration: '1 m' }

    beforeEach(() => {
      mockedShouldDedupe.mockReturnValue(true)
    })

    const invokeWithSettings = async (
      payload: unknown,
      settings: Record<string, string>,
    ): Promise<void> => {
      await extensionWebhook.onEvent({
        payload: {
          payload,
          settings,
          rawBody: Buffer.from(''),
          headers: {},
        },
        onSuccess,
        onError,
        helpers,
      })
    }

    test('Should build the limiter from meta.type + endpoint and rate-limit on messageId, then enroll when not a duplicate', async () => {
      const limit = jest.fn().mockResolvedValue({ success: true, result: {} })
      jest
        .mocked(helpers.rateLimiter)
        .mockReturnValueOnce({ limit, reset: jest.fn() })

      await invokeWithSettings(admitPayload, settingsWithRateLimit)

      expect(onError).not.toHaveBeenCalled()
      expect(onSuccess).toHaveBeenCalledTimes(1)
      expect(helpers.rateLimiter).toHaveBeenCalledWith(
        `metriport-enrollment-${MetriportWebhookType.PatientAdmit}-global`,
        { requests: 1, duration: { value: 1, unit: 'minutes' } },
      )
      expect(limit).toHaveBeenCalledWith('msg-1')
    })

    test('Should acknowledge a duplicate delivery with 200 and not enroll', async () => {
      const limit = jest.fn().mockResolvedValue({ success: false, result: {} })
      jest
        .mocked(helpers.rateLimiter)
        .mockReturnValueOnce({ limit, reset: jest.fn() })

      await invokeWithSettings(admitPayload, settingsWithRateLimit)

      expect(onSuccess).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledTimes(1)
      const call = onError.mock.calls[0][0]
      expect(call.response.statusCode).toBe(200)
      expect(call.response.message).toContain('Rate limit exceeded')
      expect(call.response.message).toContain('msg-1')
    })

    test('Should enroll normally when rate limiting is not configured', async () => {
      await invokeWithSettings(admitPayload, mockSettings)

      expect(onError).not.toHaveBeenCalled()
      expect(onSuccess).toHaveBeenCalledTimes(1)
      // With no rateLimitDuration set the limiter is never constructed.
      expect(helpers.rateLimiter).not.toHaveBeenCalled()
    })

    test('Should skip deduping entirely when the environment does not dedupe', async () => {
      mockedShouldDedupe.mockReturnValue(false)

      await invokeWithSettings(admitPayload, settingsWithRateLimit)

      expect(onError).not.toHaveBeenCalled()
      expect(onSuccess).toHaveBeenCalledTimes(1)
      expect(helpers.rateLimiter).not.toHaveBeenCalled()
    })
  })
})
