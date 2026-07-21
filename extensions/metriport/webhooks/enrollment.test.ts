import { TestHelpers } from '@awell-health/extensions-core'
import {
  enrollment as webhook,
  METRIPORT_PATIENT_IDENTIFIER_SYSTEM,
} from './enrollment'
import { fetchEncounterBundle } from './encounterBundle'
import { MetriportWebhookType, type EncounterBundle } from './types'

jest.mock('./encounterBundle')

const mockedFetchEncounterBundle = fetchEncounterBundle as jest.MockedFunction<
  typeof fetchEncounterBundle
>

const mockSettings = {
  apiKey: 'test-api-key',
  baseUrl: '',
  webhookKey: '',
}

const encounterBundle = {
  resourceType: 'Bundle',
  type: 'searchset',
  entry: [
    {
      resource: {
        resourceType: 'Encounter',
        id: 'enc-1',
        status: 'finished',
        class: { code: 'IMP' },
      },
    },
  ],
} as unknown as EncounterBundle

const admitPayload = {
  meta: {
    messageId: 'msg-1',
    when: '2026-07-21T10:00:00.000Z',
    type: MetriportWebhookType.PatientAdmit,
  },
  payload: {
    url: 'https://example.com/bundle',
    patientId: 'patient-123',
    externalId: 'external-abc',
    admitTimestamp: '2026-07-21T09:00:00.000Z',
    whenSourceSent: '2026-07-21T09:30:00.000Z',
  },
}

const dischargeSummaryBundle = {
  resourceType: 'Bundle',
  type: 'searchset',
  entry: [{ resource: { resourceType: 'Composition', id: 'discharge-1' } }],
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
      bundle: dischargeSummaryBundle,
    },
  ],
}

describe('Metriport - Webhook - Enrollment', () => {
  const { extensionWebhook, onSuccess, onError, helpers, clearMocks } =
    TestHelpers.fromWebhook(webhook)

  beforeEach(() => {
    clearMocks()
    mockedFetchEncounterBundle.mockReset()
    mockedFetchEncounterBundle.mockResolvedValue(encounterBundle)
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
    test('Should enroll the patient with eventType "adt" and the Encounter Bundle', async () => {
      await invoke(admitPayload)

      expect(onError).not.toHaveBeenCalled()
      expect(mockedFetchEncounterBundle).toHaveBeenCalledWith(
        'https://example.com/bundle',
      )
      expect(onSuccess).toHaveBeenCalledWith({
        data_points: {
          eventType: 'adt',
          metriportPatientId: 'patient-123',
          externalId: 'external-abc',
          admitTimestamp: '2026-07-21T09:00:00.000Z',
          whenSourceSent: '2026-07-21T09:30:00.000Z',
          messageId: 'msg-1',
          encounterBundle: JSON.stringify(encounterBundle),
          dischargeSummary: '',
        },
        patient_identifier: {
          system: METRIPORT_PATIENT_IDENTIFIER_SYSTEM,
          value: 'patient-123',
        },
      })
    })
  })

  describe('When a discharge summary event is received with an inline bundle', () => {
    test('Should enroll the patient with eventType "discharge" and the inline bundle', async () => {
      await invoke(dischargeSummaryPayload)

      expect(onError).not.toHaveBeenCalled()
      // Inline bundle: no fetch required.
      expect(mockedFetchEncounterBundle).not.toHaveBeenCalled()
      expect(onSuccess).toHaveBeenCalledWith({
        data_points: {
          eventType: 'discharge',
          metriportPatientId: 'patient-123',
          externalId: 'external-abc',
          admitTimestamp: '',
          whenSourceSent: '',
          messageId: 'msg-2',
          encounterBundle: '',
          dischargeSummary: JSON.stringify(dischargeSummaryBundle),
        },
        patient_identifier: {
          system: METRIPORT_PATIENT_IDENTIFIER_SYSTEM,
          value: 'patient-123',
        },
      })
    })
  })

  describe('When a discharge summary event references a URL', () => {
    test('Should fetch the bundle from the URL', async () => {
      await invoke({
        meta: {
          messageId: 'msg-3',
          when: '2026-07-22T10:00:00.000Z',
          type: MetriportWebhookType.DischargeSummary,
        },
        patients: [
          {
            patientId: 'patient-456',
            status: 'completed',
            url: 'https://example.com/discharge-summary',
          },
        ],
      })

      expect(onError).not.toHaveBeenCalled()
      expect(mockedFetchEncounterBundle).toHaveBeenCalledWith(
        'https://example.com/discharge-summary',
      )
      const call = onSuccess.mock.calls[0][0]
      expect(call.data_points.eventType).toBe('discharge')
      expect(call.data_points.metriportPatientId).toBe('patient-456')
      expect(call.data_points.dischargeSummary).toBe(
        JSON.stringify(encounterBundle),
      )
    })
  })

  describe('When a discharge summary event has neither bundle nor URL', () => {
    test('Should still enroll and capture the raw patient entry', async () => {
      await invoke({
        meta: {
          messageId: 'msg-4',
          when: '2026-07-22T10:00:00.000Z',
          type: MetriportWebhookType.DischargeSummary,
        },
        patients: [{ patientId: 'patient-789', status: 'completed' }],
      })

      expect(onError).not.toHaveBeenCalled()
      const call = onSuccess.mock.calls[0][0]
      expect(call.data_points.metriportPatientId).toBe('patient-789')
      expect(JSON.parse(call.data_points.dischargeSummary)).toMatchObject({
        patientId: 'patient-789',
        status: 'completed',
      })
    })
  })

  describe('When the encounter bundle cannot be fetched', () => {
    test('Should still enroll the patient without the bundle', async () => {
      mockedFetchEncounterBundle.mockRejectedValue(new Error('expired'))

      await invoke(admitPayload)

      expect(onError).not.toHaveBeenCalled()
      const call = onSuccess.mock.calls[0][0]
      expect(call.data_points.encounterBundle).toBe('')
      expect(call.data_points.eventType).toBe('adt')
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

  describe('When a webhook key is configured', () => {
    test('Should reject requests with a missing or invalid key', async () => {
      await extensionWebhook.onEvent!({
        payload: {
          payload: admitPayload,
          settings: { ...mockSettings, webhookKey: 'secret' },
          rawBody: Buffer.from(''),
          headers: { 'x-webhook-key': 'wrong' },
        },
        onSuccess,
        onError,
        helpers,
      })

      expect(onSuccess).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith({
        response: {
          statusCode: 401,
          message: 'Invalid or missing x-webhook-key header',
        },
      })
    })

    test('Should accept requests with a matching key', async () => {
      await extensionWebhook.onEvent!({
        payload: {
          payload: admitPayload,
          settings: { ...mockSettings, webhookKey: 'secret' },
          rawBody: Buffer.from(''),
          headers: { 'x-webhook-key': 'secret' },
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
