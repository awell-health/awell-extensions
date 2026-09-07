import crypto from 'crypto'
import {
  PayloadError,
  TestHelpers,
  VerificationError,
} from '@awell-health/extensions-core'
import { Metriport } from '../..'
import { patientAdmitBundle } from '../../actions/webhookBundle/bundle/__testdata__/patientAdmitBundle'
import { fetchBundle } from '../../shared/fetchBundle'
import { METRIPORT_IDENTIFIER_SYSTEM } from '../../shared/identifierSystem'
import { MetriportWebhookType } from '../../webhooks/types'
import { dischargeSummaryBundle } from './__testdata__/dischargeSummaryBundle'
import {
  METRIPORT_ENCOUNTER_IDENTIFIER_SYSTEM,
  metriportAdt,
} from './metriportAdt'
import { type AdtRecord, adtRecordSchema, notificationSchema } from './schemas'
import { verify } from './verify'

jest.mock('../../shared/fetchBundle')
const mockedFetchBundle = jest.mocked(fetchBundle)

const settings = {
  apiKey: 'test-api-key',
  baseUrl: '',
  webhookKey: 'secret',
  rateLimitDuration: '',
}

const VISIT_ID = '987654321'
const BUNDLE_URL = 'https://example.com/encounter-bundle'

const notification = (
  type: string,
  payload: Record<string, unknown> = {},
): Record<string, unknown> => ({
  meta: {
    messageId: `msg-${type}`,
    when: '2026-07-21T10:00:00.000Z',
    type,
  },
  payload: {
    url: BUNDLE_URL,
    patientId: 'metriport-uuid',
    externalId: 'mrn-12345',
    admitTimestamp: '2026-07-21T09:50:00.000Z',
    ...payload,
  },
})

const record = (
  event: AdtRecord['event'],
  overrides: Partial<AdtRecord> = {},
): AdtRecord => ({
  event,
  messageId: `msg-${event}`,
  externalId: 'mrn-12345',
  metriportPatientId: 'metriport-uuid',
  visitId: VISIT_ID,
  admittedAt: '2026-07-21T09:50:00.000Z',
  bundle: patientAdmitBundle,
  ...overrides,
})

const sign = (key: string, body: Buffer): string =>
  crypto.createHmac('sha256', key).update(body).digest('hex')

describe('Metriport - Ingestion - ADT notifications', () => {
  const { store, events, helpers, clearMocks } =
    TestHelpers.fromIngestion(metriportAdt)

  beforeEach(() => {
    clearMocks()
    mockedFetchBundle.mockReset()
  })

  const getRecords = async (envelope: unknown): Promise<unknown[]> =>
    await metriportAdt.getRecords!({
      envelope: notificationSchema.parse(envelope),
      rawBody: Buffer.from(JSON.stringify(envelope)),
      headers: {},
      settings,
      helpers,
    })

  const run = async (rec: AdtRecord): Promise<void> => {
    await metriportAdt.run({
      record: rec,
      store,
      events,
      settings,
      helpers,
      attempt: 1,
    })
  }

  const encounterSaves = (): Array<Record<string, unknown>> =>
    store.save.mock.calls
      .filter(([name]) => name === 'encounter')
      .map(([, data]) => data)

  describe('extension registration', () => {
    test('declares the ingestion endpoint and the identifier system it stamps', () => {
      expect(Metriport.ingestion).toContain(metriportAdt)
      expect(Metriport.identifier).toEqual({
        system: METRIPORT_IDENTIFIER_SYSTEM,
      })
    })

    test('is a webhook-sourced endpoint keyed metriportAdt', () => {
      expect(metriportAdt.key).toBe('metriportAdt')
      expect(metriportAdt.source).toBe('webhook')
    })
  })

  describe('envelope schema', () => {
    test('parses a notification type Metriport adds later rather than rejecting it', () => {
      const parsed = notificationSchema.safeParse({
        meta: {
          messageId: 'msg-new',
          when: '2026-07-21T10:00:00.000Z',
          type: 'something.entirely.new',
        },
      })
      expect(parsed.success).toBe(true)
    })

    test('parses the documented ADT payload fields', () => {
      const parsed = notificationSchema.parse(
        notification(MetriportWebhookType.PatientTransfer, {
          transfers: [
            {
              timestamp: '2026-07-21T12:00:00.000Z',
              sourceLocation: 'ED',
              destinationLocation: 'Ward 4',
            },
          ],
        }),
      )
      expect(parsed.payload?.transfers?.[0].destinationLocation).toBe('Ward 4')
    })
  })

  describe('getRecords', () => {
    test.each([
      MetriportWebhookType.PatientAdmit,
      MetriportWebhookType.PatientTransfer,
      MetriportWebhookType.PatientDischarge,
      MetriportWebhookType.DischargeSummary,
    ])('downloads the bundle and produces one record for %s', async (type) => {
      mockedFetchBundle.mockResolvedValue(patientAdmitBundle)

      const records = await getRecords(notification(type))

      expect(mockedFetchBundle).toHaveBeenCalledWith(BUNDLE_URL)
      expect(records).toHaveLength(1)
      expect(records[0]).toMatchObject({
        event: type,
        messageId: `msg-${type}`,
        externalId: 'mrn-12345',
        metriportPatientId: 'metriport-uuid',
        visitId: VISIT_ID,
        admittedAt: '2026-07-21T09:50:00.000Z',
        bundle: patientAdmitBundle,
      })
      expect((records[0] as AdtRecord).location).toBeUndefined()
      expect(adtRecordSchema.safeParse(records[0]).success).toBe(true)
    })

    test('produces no records, and fetches nothing, for an unhandled type', async () => {
      const records = await getRecords(
        notification('patient.laboratory', { url: BUNDLE_URL }),
      )

      expect(records).toEqual([])
      expect(mockedFetchBundle).not.toHaveBeenCalled()
    })

    test('produces no records for a ping', async () => {
      const records = await getRecords({
        meta: {
          messageId: 'msg-ping',
          when: '2026-07-21T10:00:00.000Z',
          type: 'ping',
        },
        ping: 'abc',
      })

      expect(records).toEqual([])
    })

    test('keys the visit on the Encounter visit number, falling back to the Encounter id', async () => {
      const encounterOnlyId = {
        ...patientAdmitBundle,
        entry: patientAdmitBundle.entry?.map((entry) =>
          entry.resource?.resourceType === 'Encounter'
            ? { ...entry, resource: { ...entry.resource, identifier: [] } }
            : entry,
        ),
      }
      mockedFetchBundle.mockResolvedValue(encounterOnlyId)

      const [rec] = await getRecords(
        notification(MetriportWebhookType.PatientAdmit),
      )

      expect((rec as AdtRecord).visitId).toBe(
        'c60544e1-2e37-45fb-8160-3d583902cfde',
      )
    })

    test('takes the location from the last transfer destination on the notification', async () => {
      mockedFetchBundle.mockResolvedValue(patientAdmitBundle)

      const [rec] = await getRecords(
        notification(MetriportWebhookType.PatientTransfer, {
          transfers: [
            {
              timestamp: '2026-07-21T11:00:00.000Z',
              destinationLocation: 'ED',
            },
            {
              timestamp: '2026-07-21T12:00:00.000Z',
              destinationLocation: 'Ward 4',
            },
          ],
        }),
      )

      expect((rec as AdtRecord).location).toBe('Ward 4')
    })

    test('falls back to the Encounter period when the notification carries no timestamps', async () => {
      mockedFetchBundle.mockResolvedValue(dischargeSummaryBundle)

      const [rec] = (await getRecords(
        notification(MetriportWebhookType.PatientDischarge, {
          admitTimestamp: undefined,
          dischargeTimestamp: undefined,
        }),
      )) as AdtRecord[]

      expect(rec.admittedAt).toBe('2024-07-22T19:50:00.000Z')
      expect(rec.dischargedAt).toBe('2024-07-25T14:10:00.000Z')
    })

    test('prefers the notification timestamps over the Encounter period', async () => {
      mockedFetchBundle.mockResolvedValue(dischargeSummaryBundle)

      const [rec] = (await getRecords(
        notification(MetriportWebhookType.PatientDischarge, {
          dischargeTimestamp: '2026-07-24T08:00:00.000Z',
        }),
      )) as AdtRecord[]

      expect(rec.admittedAt).toBe('2026-07-21T09:50:00.000Z')
      expect(rec.dischargedAt).toBe('2026-07-24T08:00:00.000Z')
    })

    test('rejects a handled notification whose bundle carries no Encounter', async () => {
      mockedFetchBundle.mockResolvedValue({
        resourceType: 'Bundle',
        type: 'collection',
        entry: [{ resource: { resourceType: 'Patient', id: 'p1' } }],
      })

      await expect(
        getRecords(notification(MetriportWebhookType.PatientAdmit)),
      ).rejects.toThrow(PayloadError)
    })

    test('rejects a handled notification with no payload rather than acknowledging it', async () => {
      await expect(
        getRecords({
          meta: {
            messageId: 'msg-bad',
            when: '2026-07-21T10:00:00.000Z',
            type: MetriportWebhookType.PatientAdmit,
          },
        }),
      ).rejects.toThrow(PayloadError)
    })

    test('a record without an externalId fails the record schema, so no patient is minted for it', async () => {
      mockedFetchBundle.mockResolvedValue(patientAdmitBundle)

      const [rec] = await getRecords(
        notification(MetriportWebhookType.PatientAdmit, {
          externalId: undefined,
        }),
      )

      expect(adtRecordSchema.safeParse(rec).success).toBe(false)
    })
  })

  describe('identity', () => {
    test('resolves externalId under the extension identifier system, not the Metriport UUID', () => {
      expect(metriportAdt.identity.system).toBe(Metriport.identifier?.system)
      expect(
        metriportAdt.identity.resolveValue(
          record(MetriportWebhookType.PatientAdmit),
        ),
      ).toBe('mrn-12345')
    })
  })

  describe('run', () => {
    test('writes the transfer destination onto the encounter as its location', async () => {
      await run(
        record(MetriportWebhookType.PatientTransfer, { location: 'Ward 4' }),
      )

      expect(encounterSaves()[0].location).toBe('Ward 4')
    })

    test('writes only what the message knows, so a later message never clears an earlier one', async () => {
      await run(record(MetriportWebhookType.PatientAdmit))
      await run(
        record(MetriportWebhookType.PatientTransfer, { location: 'Ward 4' }),
      )
      await run(
        record(MetriportWebhookType.PatientDischarge, {
          dischargedAt: '2026-07-24T08:00:00.000Z',
        }),
      )

      const [admit, transfer, discharge] = encounterSaves()
      expect(Object.keys(admit)).toEqual(['identifier', 'status', 'startedAt'])
      expect(Object.keys(transfer)).toEqual([
        'identifier',
        'status',
        'startedAt',
        'location',
      ])
      expect(Object.keys(discharge)).toEqual([
        'identifier',
        'status',
        'startedAt',
        'endedAt',
      ])
    })

    test('saves only the patient and the encounter', async () => {
      await run(record(MetriportWebhookType.PatientAdmit))

      expect(store.save.mock.calls.map(([name]) => name)).toEqual([
        'patient',
        'encounter',
      ])
    })

    test('writes patient demographics from the bundle', async () => {
      await run(record(MetriportWebhookType.PatientAdmit))

      expect(store.save).toHaveBeenCalledWith('patient', {
        name: [{ use: 'official', family: 'Johnson', given: ['Sarah'] }],
        gender: 'female',
        birthDate: '1975-06-15',
      })
    })

    test('omits demographics the bundle does not state rather than writing them as undefined', async () => {
      const withoutBirthDate = {
        ...patientAdmitBundle,
        entry: patientAdmitBundle.entry?.map((entry) =>
          entry.resource?.resourceType === 'Patient'
            ? {
                ...entry,
                resource: { ...entry.resource, birthDate: undefined },
              }
            : entry,
        ),
      }

      await run(
        record(MetriportWebhookType.PatientAdmit, { bundle: withoutBirthDate }),
      )

      const [, demographics] = store.save.mock.calls.find(
        ([name]) => name === 'patient',
      ) as [string, Record<string, unknown>]
      expect(Object.keys(demographics)).toEqual(['name', 'gender'])
    })

    test('admit, transfer and discharge converge on one encounter keyed on the visit id', async () => {
      await run(record(MetriportWebhookType.PatientAdmit))
      await run(record(MetriportWebhookType.PatientTransfer))
      await run(
        record(MetriportWebhookType.PatientDischarge, {
          dischargedAt: '2026-07-24T08:00:00.000Z',
        }),
      )

      const saves = encounterSaves()
      expect(saves).toHaveLength(3)
      saves.forEach((save) => {
        expect(save.identifier).toEqual({
          system: METRIPORT_ENCOUNTER_IDENTIFIER_SYSTEM,
          value: VISIT_ID,
        })
      })
      expect(saves[0]).toMatchObject({
        status: 'in-progress',
        startedAt: '2026-07-21T09:50:00.000Z',
      })
      expect(saves[1].status).toBe('in-progress')
      expect(saves[2]).toMatchObject({
        status: 'finished',
        endedAt: '2026-07-24T08:00:00.000Z',
      })
    })

    test.each<[AdtRecord['event'], string]>([
      [MetriportWebhookType.PatientAdmit, 'patient.admitted'],
      [MetriportWebhookType.PatientTransfer, 'patient.transferred'],
      [MetriportWebhookType.PatientDischarge, 'patient.discharged'],
    ])(
      'publishes the clinical event and the fhir-export event for %s',
      async (type, key) => {
        await run(record(type))

        expect(events.publish).toHaveBeenCalledWith({ key })
        expect(events.publish).toHaveBeenCalledWith({
          key: 'fhir.bundle-received',
        })
        expect(events.publish).toHaveBeenCalledTimes(2)
      },
    )

    test('the fhir-export event carries no bundle: publish takes the key alone', async () => {
      await run(record(MetriportWebhookType.PatientAdmit))

      const published = events.publish.mock.calls.map(([event]) => event)
      published.forEach((event) => {
        expect(Object.keys(event)).toEqual(['key'])
      })
    })

    test('a discharge summary converges on the same, closed encounter and publishes documentAvailable', async () => {
      await run(
        record(MetriportWebhookType.DischargeSummary, {
          bundle: dischargeSummaryBundle,
          dischargedAt: '2024-07-25T14:10:00.000Z',
        }),
      )

      expect(encounterSaves()).toEqual([
        {
          identifier: {
            system: METRIPORT_ENCOUNTER_IDENTIFIER_SYSTEM,
            value: VISIT_ID,
          },
          status: 'finished',
          startedAt: '2026-07-21T09:50:00.000Z',
          endedAt: '2024-07-25T14:10:00.000Z',
        },
      ])
      expect(store.save.mock.calls.map(([name]) => name)).toEqual([
        'patient',
        'encounter',
      ])
      expect(events.publish).toHaveBeenCalledWith({ key: 'document.available' })
      expect(events.publish).toHaveBeenCalledWith({
        key: 'fhir.bundle-received',
      })
      expect(events.publish).toHaveBeenCalledTimes(2)
    })
  })

  describe('verify', () => {
    const body = Buffer.from(
      JSON.stringify(notification(MetriportWebhookType.PatientAdmit)),
    )
    const ctx = (
      headers: Record<string, string>,
      rawBody = body,
      webhookKey: string | undefined = 'secret',
    ): Parameters<typeof verify>[0] => ({
      rawBody,
      headers,
      settings: { ...settings, webhookKey },
      endpoint: { id: 'endpoint-1', url: 'https://example.com/ingest' },
    })

    test('accepts a request whose x-metriport-signature is the HMAC-SHA256 hex of the raw body', async () => {
      await expect(
        verify(ctx({ 'x-metriport-signature': sign('secret', body) })),
      ).resolves.toBeUndefined()
    })

    test('rejects a signature computed with another key', async () => {
      await expect(
        verify(ctx({ 'x-metriport-signature': sign('wrong-key', body) })),
      ).rejects.toThrow(VerificationError)
    })

    test('rejects a request with no signature header', async () => {
      await expect(verify(ctx({}))).rejects.toThrow(VerificationError)
    })

    test('rejects every request when no webhook key is configured', async () => {
      await expect(
        verify(ctx({ 'x-metriport-signature': sign('', body) }, body, '')),
      ).rejects.toThrow(VerificationError)
    })

    test('answers a signed ping with pong and stops processing', async () => {
      const ping = Buffer.from(
        JSON.stringify({
          ping: 'random-sequence',
          meta: {
            messageId: 'msg-ping',
            when: '2026-07-21T10:00:00.000Z',
            type: 'ping',
          },
        }),
      )

      await expect(
        verify(ctx({ 'x-metriport-signature': sign('secret', ping) }, ping)),
      ).resolves.toEqual({ status: 200, body: { pong: 'random-sequence' } })
    })

    test('does not answer an unsigned ping', async () => {
      const ping = Buffer.from(
        JSON.stringify({ ping: 'random-sequence', meta: { type: 'ping' } }),
      )

      await expect(verify(ctx({}, ping))).rejects.toThrow(VerificationError)
    })
  })
})
