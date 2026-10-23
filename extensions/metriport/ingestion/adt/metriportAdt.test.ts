import crypto from 'crypto'
import { type Condition, type Encounter } from '@medplum/fhirtypes'
import {
  PayloadValidationError,
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
  CONDITION_OBJECT,
  ENCOUNTER_OBJECT,
  ENCOUNTER_STATUS_SYSTEM,
  LOCATION_OBJECT,
  METRIPORT_CONDITION_IDENTIFIER_SYSTEM,
  METRIPORT_ENCOUNTER_IDENTIFIER_SYSTEM,
  METRIPORT_LOCATION_IDENTIFIER_SYSTEM,
  METRIPORT_ORGANIZATION_IDENTIFIER_SYSTEM,
  ORGANIZATION_OBJECT,
} from './catalog'
import { metriportAdt } from './metriportAdt'
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

const resourceOf = <T>(
  bundle: typeof patientAdmitBundle,
  resourceType: string,
): T =>
  bundle.entry?.find((entry) => entry.resource?.resourceType === resourceType)
    ?.resource as T

/** The resources in `patientAdmitBundle`, the source of every saved detail. */
const admitEncounter = resourceOf<Encounter>(patientAdmitBundle, 'Encounter')
const admitCondition = resourceOf<Condition>(patientAdmitBundle, 'Condition')
const dischargeEncounter = resourceOf<Encounter>(
  dischargeSummaryBundle,
  'Encounter',
)

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
  bundleRef: 'memory://metriport/adt/msg/bundle.json',
  encounter: admitEncounter,
  conditions: [],
  ...overrides,
})

const locationRef = (value: string): Record<string, unknown> => ({
  $ref: {
    object: LOCATION_OBJECT,
    identifier: { system: METRIPORT_LOCATION_IDENTIFIER_SYSTEM, value },
  },
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

  const savesOf = (object: string): Array<Record<string, unknown>> =>
    store.save.mock.calls
      .filter(([name]) => name === object)
      .map(([, data]) => data)

  /** The ids `store.save` handed back for each save of `object`, in order. */
  const savedIdsOf = (object: string): string[] =>
    store.save.mock.calls.flatMap(([name], index) =>
      name === object
        ? [(store.save.mock.results[index].value as { id: string }).id]
        : [],
    )

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
      })
      expect(adtRecordSchema.safeParse(records[0]).success).toBe(true)
    })

    test('stores the bundle in the object store, named after the message, and carries only its reference', async () => {
      mockedFetchBundle.mockResolvedValue(patientAdmitBundle)

      const [rec] = (await getRecords(
        notification(MetriportWebhookType.PatientAdmit),
      )) as AdtRecord[]

      expect(helpers.objectStore.put).toHaveBeenCalledWith(
        'metriport/adt/msg-patient.admit/bundle.json',
        JSON.stringify(patientAdmitBundle),
      )
      expect(rec.bundleRef).toBe(
        'memory://metriport/adt/msg-patient.admit/bundle.json',
      )
      expect(rec).not.toHaveProperty('bundle')
      await expect(helpers.objectStore.get(rec.bundleRef)).resolves.toBe(
        JSON.stringify(patientAdmitBundle),
      )
    })

    test('names the object safely whatever the message id holds', async () => {
      mockedFetchBundle.mockResolvedValue(patientAdmitBundle)

      await getRecords({
        ...notification(MetriportWebhookType.PatientAdmit),
        meta: {
          messageId: '..',
          when: '2026-07-21T10:00:00.000Z',
          type: MetriportWebhookType.PatientAdmit,
        },
      })

      expect(helpers.objectStore.put).toHaveBeenCalledWith(
        'metriport/adt/%2E%2E/bundle.json',
        expect.any(String),
      )
    })

    test('carries the Encounter and the Conditions it points at, found in the bundle', async () => {
      mockedFetchBundle.mockResolvedValue(patientAdmitBundle)

      const [rec] = (await getRecords(
        notification(MetriportWebhookType.PatientAdmit),
      )) as AdtRecord[]

      expect(rec.encounter).toEqual(admitEncounter)
      expect(rec.conditions).toEqual([admitCondition])
      expect(rec).not.toHaveProperty('locations')
    })

    test('carries no Condition the bundle does not hold', async () => {
      mockedFetchBundle.mockResolvedValue(dischargeSummaryBundle)

      const [rec] = (await getRecords(
        notification(MetriportWebhookType.DischargeSummary),
      )) as AdtRecord[]

      expect(rec.conditions).toEqual([])
      expect(adtRecordSchema.safeParse(rec).success).toBe(true)
    })

    test('produces no records, and fetches and stores nothing, for an unhandled type', async () => {
      const records = await getRecords(
        notification('patient.laboratory', { url: BUNDLE_URL }),
      )

      expect(records).toEqual([])
      expect(mockedFetchBundle).not.toHaveBeenCalled()
      expect(helpers.objectStore.put).not.toHaveBeenCalled()
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

    test('rejects a handled notification whose bundle carries no Encounter, storing nothing', async () => {
      mockedFetchBundle.mockResolvedValue({
        resourceType: 'Bundle',
        type: 'collection',
        entry: [{ resource: { resourceType: 'Patient', id: 'p1' } }],
      })

      await expect(
        getRecords(notification(MetriportWebhookType.PatientAdmit)),
      ).rejects.toThrow(PayloadValidationError)
      expect(helpers.objectStore.put).not.toHaveBeenCalled()
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
      ).rejects.toThrow(PayloadValidationError)
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

  describe('identifier', () => {
    test('resolves externalId, not the Metriport UUID, under the extension identifier system', () => {
      expect(metriportAdt.identifier.system).toBeUndefined()
      expect(
        metriportAdt.identifier.resolveValue(
          record(MetriportWebhookType.PatientAdmit),
        ),
      ).toBe('mrn-12345')
    })
  })

  describe('run', () => {
    test('writes the Encounter in the catalog shape, referencing its patient, Locations and Conditions', async () => {
      await run(
        record(MetriportWebhookType.PatientAdmit, {
          conditions: [admitCondition],
        }),
      )

      expect(savesOf(ENCOUNTER_OBJECT)).toEqual([
        {
          awell_identifier: {
            system: METRIPORT_ENCOUNTER_IDENTIFIER_SYSTEM,
            value: VISIT_ID,
          },
          awell_status: {
            system: ENCOUNTER_STATUS_SYSTEM,
            code: 'in-progress',
          },
          awell_class: {
            system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
            code: 'AMB',
            display: 'Ambulatory',
          },
          awell_subject: 'patient-1',
          awell_period_start: '2026-07-21T09:50:00.000Z',
          awell_location: [locationRef('3ca5e8d2-7c84-45ab-91e7-834f8becde12')],
          awell_diagnosis: [`${CONDITION_OBJECT}-1`],
        },
      ])
    })

    test('saves the patient, then the Conditions, then the Encounter that points at them; never a Location', async () => {
      await run(
        record(MetriportWebhookType.PatientAdmit, {
          conditions: [admitCondition],
        }),
      )

      expect(store.save.mock.calls.map(([name]) => name)).toEqual([
        'patient',
        CONDITION_OBJECT,
        ENCOUNTER_OBJECT,
      ])
      // The identifier the record was resolved by: it answers the patient's id
      // and changes nothing.
      expect(savesOf('patient')).toEqual([
        {
          identifier: {
            system: METRIPORT_IDENTIFIER_SYSTEM,
            value: 'mrn-12345',
          },
        },
      ])
    })

    test('writes a Condition as the patient record Metriport names it by', async () => {
      await run(
        record(MetriportWebhookType.PatientAdmit, {
          conditions: [admitCondition],
        }),
      )

      expect(savesOf(CONDITION_OBJECT)).toEqual([
        {
          awell_identifier: {
            system: METRIPORT_CONDITION_IDENTIFIER_SYSTEM,
            value: '8724f6e9-c531-48ba-9d34-7e2a81c05fb3',
          },
          awell_code: {
            system: 'http://snomed.info/sct',
            code: '194828000',
            display: 'Stable angina',
          },
          awell_clinical_status: {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'active',
            display: 'Active',
          },
          awell_verification_status: {
            system:
              'http://terminology.hl7.org/CodeSystem/condition-ver-status',
            code: 'confirmed',
            display: 'Confirmed',
          },
          awell_category: [
            {
              system:
                'http://terminology.hl7.org/CodeSystem/condition-category',
              code: 'encounter-diagnosis',
              display: 'Encounter Diagnosis',
            },
          ],
          awell_subject: 'patient-1',
          awell_onset_at: '2024-03-15T14:20:00.000Z',
          awell_recorded_at: '2024-03-15T16:45:00.000Z',
        },
      ])
    })

    test('skips a Condition without an id: with nothing to find it by, every message would mint a new one', async () => {
      await run(
        record(MetriportWebhookType.PatientAdmit, {
          conditions: [{ ...admitCondition, id: undefined }],
        }),
      )

      expect(store.save.mock.calls.map(([name]) => name)).toEqual([
        'patient',
        ENCOUNTER_OBJECT,
      ])
      expect(savesOf(ENCOUNTER_OBJECT)[0]).not.toHaveProperty('awell_diagnosis')
    })

    test('points at every Location and the service provider by Metriport id, and at none it cannot name', async () => {
      await run(
        record(MetriportWebhookType.PatientAdmit, {
          encounter: {
            ...admitEncounter,
            location: [
              { location: { reference: 'Location/L-1' } },
              { location: { reference: 'urn:uuid:L-2' } },
              { location: { display: 'Ward without a reference' } },
            ],
            serviceProvider: { reference: 'Organization/O-1' },
          },
        }),
      )

      const [save] = savesOf(ENCOUNTER_OBJECT)
      expect(save.awell_location).toEqual([
        locationRef('L-1'),
        locationRef('L-2'),
      ])
      expect(save.awell_service_provider).toEqual({
        $ref: {
          object: ORGANIZATION_OBJECT,
          identifier: {
            system: METRIPORT_ORGANIZATION_IDENTIFIER_SYSTEM,
            value: 'O-1',
          },
        },
      })
    })

    test('writes no location or service provider for an Encounter that names none', async () => {
      await run(
        record(MetriportWebhookType.PatientAdmit, {
          encounter: {
            ...admitEncounter,
            location: [],
            serviceProvider: undefined,
          },
        }),
      )

      const [save] = savesOf(ENCOUNTER_OBJECT)
      expect(save).not.toHaveProperty('awell_location')
      expect(save).not.toHaveProperty('awell_service_provider')
    })

    test('writes every coding of every concept to a field that holds many', async () => {
      await run(
        record(MetriportWebhookType.PatientAdmit, {
          encounter: {
            ...admitEncounter,
            type: [
              { coding: [{ system: 'urn:t', code: 'A' }] },
              {
                coding: [
                  { system: 'urn:t', code: 'B' },
                  { system: 'urn:u', code: 'b' },
                ],
              },
            ],
            reasonCode: [
              { coding: [{ system: 'urn:r', code: 'R1', display: 'One' }] },
              { coding: [{ system: 'urn:r', code: 'R2' }] },
            ],
          },
        }),
      )

      const [save] = savesOf(ENCOUNTER_OBJECT)
      expect(save.awell_type).toEqual([
        { system: 'urn:t', code: 'A' },
        { system: 'urn:t', code: 'B' },
        { system: 'urn:u', code: 'b' },
      ])
      expect(save.awell_reason).toEqual([
        { system: 'urn:r', code: 'R1', display: 'One' },
        { system: 'urn:r', code: 'R2' },
      ])
    })

    test('writes one coding to a field that holds one: the first the catalog can hold', async () => {
      await run(
        record(MetriportWebhookType.PatientDischarge, {
          encounter: {
            ...admitEncounter,
            serviceType: {
              coding: [
                { code: 'no-system' },
                { system: 'urn:s', code: 'CARD', display: 'Cardiology' },
                { system: 'urn:s2', code: 'card' },
              ],
            },
            hospitalization: {
              dischargeDisposition: {
                coding: [
                  {
                    system:
                      'http://terminology.hl7.org/CodeSystem/discharge-disposition',
                    code: 'home',
                    display: 'Home',
                  },
                ],
              },
            },
          },
        }),
      )

      const [save] = savesOf(ENCOUNTER_OBJECT)
      expect(save.awell_service_type).toEqual({
        system: 'urn:s',
        code: 'CARD',
        display: 'Cardiology',
      })
      expect(save.awell_discharge_disposition).toEqual({
        system: 'http://terminology.hl7.org/CodeSystem/discharge-disposition',
        code: 'home',
        display: 'Home',
      })
    })

    test('leaves out a coding without a system, and a concept with only text: the catalog cannot hold either', async () => {
      // The admit bundle's service type is `394592004` with no system, and its
      // reason is the text "Chest pain".
      await run(record(MetriportWebhookType.PatientAdmit))

      const [save] = savesOf(ENCOUNTER_OBJECT)
      expect(save).not.toHaveProperty('awell_service_type')
      expect(save).not.toHaveProperty('awell_reason')
    })

    test('writes only what the message knows, so a later message never clears an earlier one', async () => {
      const bare: Encounter = {
        resourceType: 'Encounter',
        status: 'in-progress',
        class: admitEncounter.class,
      }
      await run(record(MetriportWebhookType.PatientAdmit, { encounter: bare }))
      await run(
        record(MetriportWebhookType.PatientDischarge, {
          encounter: bare,
          dischargedAt: '2026-07-24T08:00:00.000Z',
        }),
      )

      const [admit, discharge] = savesOf(ENCOUNTER_OBJECT)
      expect(Object.keys(admit)).toEqual([
        'awell_identifier',
        'awell_status',
        'awell_class',
        'awell_subject',
        'awell_period_start',
      ])
      expect(Object.keys(discharge)).toEqual([
        'awell_identifier',
        'awell_status',
        'awell_class',
        'awell_subject',
        'awell_period_start',
        'awell_period_end',
      ])
    })

    test('admit, transfer and discharge converge on one encounter keyed on the visit id', async () => {
      await run(record(MetriportWebhookType.PatientAdmit))
      await run(record(MetriportWebhookType.PatientTransfer))
      await run(
        record(MetriportWebhookType.PatientDischarge, {
          dischargedAt: '2026-07-24T08:00:00.000Z',
        }),
      )

      const saves = savesOf(ENCOUNTER_OBJECT)
      expect(saves).toHaveLength(3)
      saves.forEach((save) => {
        expect(save.awell_identifier).toEqual({
          system: METRIPORT_ENCOUNTER_IDENTIFIER_SYSTEM,
          value: VISIT_ID,
        })
      })
      expect(saves.map((save) => save.awell_status)).toEqual([
        { system: ENCOUNTER_STATUS_SYSTEM, code: 'in-progress' },
        { system: ENCOUNTER_STATUS_SYSTEM, code: 'in-progress' },
        { system: ENCOUNTER_STATUS_SYSTEM, code: 'finished' },
      ])
      expect(saves[2].awell_period_end).toBe('2026-07-24T08:00:00.000Z')
    })

    test.each<[AdtRecord['event'], string]>([
      [MetriportWebhookType.PatientAdmit, 'patient.admitted'],
      [MetriportWebhookType.PatientTransfer, 'patient.transferred'],
      [MetriportWebhookType.PatientDischarge, 'patient.discharged'],
    ])(
      'publishes the clinical event for %s, pointing at the Encounter it saved, and the fhir-export event',
      async (type, key) => {
        await run(record(type, { conditions: [admitCondition] }))

        // The id `save` handed back for the Encounter, not the patient's or a
        // Condition's, and not Metriport's visit id.
        const [encounterId] = savedIdsOf(ENCOUNTER_OBJECT)
        expect(events.publish).toHaveBeenCalledWith({
          key,
          ref: `encounter/${encounterId}`,
        })
        expect(events.publish).toHaveBeenCalledWith(
          expect.objectContaining({ key: 'fhir.bundle-received' }),
        )
        expect(events.publish).toHaveBeenCalledTimes(2)
      },
    )

    test('the fhir-export event points at the bundle the object store kept, and carries no bundle', async () => {
      mockedFetchBundle.mockResolvedValue(patientAdmitBundle)
      const [rec] = (await getRecords(
        notification(MetriportWebhookType.PatientAdmit),
      )) as AdtRecord[]

      await run(rec)

      // Whatever `put` answered, so the test holds whatever shape the store's
      // key takes.
      const stored = await jest.mocked(helpers.objectStore.put).mock.results[0]
        .value
      expect(events.publish).toHaveBeenCalledWith({
        key: 'fhir.bundle-received',
        ref: stored,
      })
    })

    test('a discharge summary converges on the same, closed encounter and publishes discharge.summary-received', async () => {
      await run(
        record(MetriportWebhookType.DischargeSummary, {
          encounter: dischargeEncounter,
          dischargedAt: '2024-07-25T14:10:00.000Z',
        }),
      )

      expect(savesOf(ENCOUNTER_OBJECT)).toEqual([
        {
          awell_identifier: {
            system: METRIPORT_ENCOUNTER_IDENTIFIER_SYSTEM,
            value: VISIT_ID,
          },
          awell_status: { system: ENCOUNTER_STATUS_SYSTEM, code: 'finished' },
          awell_class: {
            system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
            code: 'IMP',
            display: 'inpatient encounter',
          },
          awell_subject: 'patient-1',
          awell_period_start: '2026-07-21T09:50:00.000Z',
          awell_period_end: '2024-07-25T14:10:00.000Z',
        },
      ])
      // Strictly: the event carries no `ref` at all, not even an undefined one,
      // which `toHaveBeenCalledWith` would let through.
      const summary = events.publish.mock.calls.find(
        ([event]) => event.key === 'discharge.summary-received',
      )
      expect(summary?.[0]).toStrictEqual({ key: 'discharge.summary-received' })
      expect(events.publish).toHaveBeenCalledWith({
        key: 'fhir.bundle-received',
        ref: 'memory://metriport/adt/msg/bundle.json',
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
