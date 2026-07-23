import crypto from 'crypto'
import { TestHelpers } from '@awell-health/extensions-core'
import {
  enrollment as webhook,
  METRIPORT_PATIENT_IDENTIFIER_SYSTEM,
} from './enrollment'
import { MetriportWebhookType } from './types'

const sign = (key: string, body: string): string =>
  crypto.createHmac('sha256', key).update(body).digest('hex')

const mockSettings = {
  apiKey: 'test-api-key',
  baseUrl: '',
  webhookKey: '',
}

const admitPayload = {
  meta: {
    messageId: 'msg-1',
    when: '2026-07-21T10:00:00.000Z',
    type: MetriportWebhookType.PatientAdmit,
  },
  payload: {
    url: 'https://example.com/encounter-bundle',
    patientId: 'patient-123',
    externalId: 'external-abc',
    admitTimestamp: '2026-07-21T09:00:00.000Z',
    whenSourceSent: '2026-07-21T09:30:00.000Z',
  },
}

const dischargeSummaryPayload = {
  meta: {
    messageId: 'msg-2',
    when: '2026-07-22T10:00:00.000Z',
    type: MetriportWebhookType.DischargeSummary,
  },
  patients: [
    {
      patientId: 'patient-123',
      externalId: 'external-abc',
      status: 'completed',
      url: 'https://example.com/discharge-summary',
    },
  ],
}

describe('Metriport - Webhook - Enrollment', () => {
  const { extensionWebhook, onSuccess, onError, helpers, clearMocks } =
    TestHelpers.fromWebhook(webhook)

  beforeEach(() => {
    clearMocks()
  })

  const invoke = async (payload: unknown, headers = {}): Promise<void> => {
    await extensionWebhook.onEvent!({
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

  describe('When an admit (adt) event is received', () => {
    test('Should enroll the patient with eventType "adt" and the bundle URL', async () => {
      await invoke(admitPayload)

      expect(onError).not.toHaveBeenCalled()
      expect(onSuccess).toHaveBeenCalledWith({
        data_points: {
          eventType: 'adt',
          metriportPatientId: 'patient-123',
          externalId: 'external-abc',
          admitTimestamp: '2026-07-21T09:00:00.000Z',
          whenSourceSent: '2026-07-21T09:30:00.000Z',
          messageId: 'msg-1',
          bundleUrl: 'https://example.com/encounter-bundle',
        },
        patient_identifier: {
          system: METRIPORT_PATIENT_IDENTIFIER_SYSTEM,
          value: 'patient-123',
        },
      })
    })
  })

  describe('When a discharge summary event is received', () => {
    test('Should enroll the patient with eventType "discharge" and the bundle URL', async () => {
      await invoke(dischargeSummaryPayload)

      expect(onError).not.toHaveBeenCalled()
      expect(onSuccess).toHaveBeenCalledWith({
        data_points: {
          eventType: 'discharge',
          metriportPatientId: 'patient-123',
          externalId: 'external-abc',
          admitTimestamp: '',
          whenSourceSent: '',
          messageId: 'msg-2',
          bundleUrl: 'https://example.com/discharge-summary',
        },
        patient_identifier: {
          system: METRIPORT_PATIENT_IDENTIFIER_SYSTEM,
          value: 'patient-123',
        },
      })
    })

    test('Should enroll with an empty bundle URL when none is provided', async () => {
      await invoke({
        meta: {
          messageId: 'msg-3',
          when: '2026-07-22T10:00:00.000Z',
          type: MetriportWebhookType.DischargeSummary,
        },
        patients: [{ patientId: 'patient-789', status: 'completed' }],
      })

      expect(onError).not.toHaveBeenCalled()
      const call = onSuccess.mock.calls[0][0]
      expect(call.data_points.metriportPatientId).toBe('patient-789')
      expect(call.data_points.bundleUrl).toBe('')
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
          message: 'Ping received: test-ping-value',
        },
      })
    })
  })

  describe('When an unhandled ADT event is received', () => {
    test('Should acknowledge a transfer with 200 and not enroll', async () => {
      await invoke({
        meta: {
          messageId: 'msg-transfer',
          when: '2026-07-21T10:00:00.000Z',
          type: MetriportWebhookType.PatientTransfer,
        },
        payload: {
          url: 'https://example.com/bundle',
          patientId: 'patient-123',
          admitTimestamp: '2026-07-21T09:00:00.000Z',
        },
      })

      expect(onSuccess).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith({
        response: {
          statusCode: 200,
          message: `Ignoring unhandled event type: ${MetriportWebhookType.PatientTransfer}`,
        },
      })
    })

    test('Should acknowledge a patient.discharge ADT notification with 200 and not enroll', async () => {
      await invoke({
        meta: {
          messageId: 'msg-adt-discharge',
          when: '2026-07-21T10:00:00.000Z',
          type: MetriportWebhookType.PatientDischarge,
        },
        payload: {
          url: 'https://example.com/bundle',
          patientId: 'patient-123',
          admitTimestamp: '2026-07-21T09:00:00.000Z',
          dischargeTimestamp: '2026-07-22T09:00:00.000Z',
        },
      })

      expect(onSuccess).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith({
        response: {
          statusCode: 200,
          message: `Ignoring unhandled event type: ${MetriportWebhookType.PatientDischarge}`,
        },
      })
    })
  })

  describe('When a webhook key is configured (HMAC signature verification)', () => {
    const rawBody = Buffer.from(JSON.stringify(admitPayload))

    test('Should reject requests with a missing signature header', async () => {
      await extensionWebhook.onEvent!({
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
      await extensionWebhook.onEvent!({
        payload: {
          payload: admitPayload,
          settings: { ...mockSettings, webhookKey: 'secret' },
          rawBody,
          headers: { 'x-metriport-signature': sign('wrong-key', rawBody.toString()) },
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
      await extensionWebhook.onEvent!({
        payload: {
          payload: admitPayload,
          settings: { ...mockSettings, webhookKey: 'secret' },
          rawBody,
          headers: { 'x-metriport-signature': sign('secret', rawBody.toString()) },
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(onError).not.toHaveBeenCalled()
      expect(onSuccess).toHaveBeenCalledTimes(1)
    })
  })

  describe('When the payload is invalid', () => {
    test('Should call onError', async () => {
      await invoke({ meta: { type: 'not-a-real-type' } })

      expect(onSuccess).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledTimes(1)
    })
  })
})
