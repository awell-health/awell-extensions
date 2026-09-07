import {
  PayloadError,
  unhandled,
  withSettings,
} from '@awell-health/extensions-core'
import { isNil, isUndefined, omitBy } from 'lodash'
import { fetchBundle } from '../../shared/fetchBundle'
import { type settings } from '../../settings'
import { METRIPORT_IDENTIFIER_SYSTEM } from '../../shared/identifierSystem'
import { MetriportWebhookType } from '../../webhooks/types'
import { isAdtWebhookType } from '../../webhooks/validation.zod'
import { demographicsFrom, findEncounter, visitIdFrom } from './bundle'
import { adtRecordSchema, notificationSchema } from './schemas'
import { verify } from './verify'

export const METRIPORT_ENCOUNTER_IDENTIFIER_SYSTEM =
  'https://metriport.com/encounter'

/**
 * Metriport posts every real-time notification to one URL, discriminated on
 * `meta.type`, with the clinical data behind a presigned `payload.url` (a FHIR
 * bundle, valid for 600 s). Admit, transfer, discharge and the discharge
 * summary all converge on one encounter keyed on the visit.
 *
 * Only the patient and the encounter are saved for now. The rest of what the
 * bundle carries (facility, conditions, the discharge summary document) is
 * modelled later; the bundle itself is retained by the runtime and reaches
 * FHIR data movement through `fhir.bundle-received`.
 * https://docs.metriport.com/medical-api/handling-data/realtime-patient-notifications
 */
export const metriportAdt = withSettings<typeof settings>().endpoint({
  key: 'metriportAdt',
  title: 'Metriport ADT notifications',
  description:
    'Receives Metriport real-time patient notifications. Handles `patient.admit`, `patient.transfer`, `patient.discharge` and `medical.discharge-summary`, downloading the FHIR bundle each points at; any other notification type is acknowledged without producing a record.',
  source: 'webhook',
  verify,
  schema: { envelope: notificationSchema, payload: adtRecordSchema },
  getRecords: async ({ envelope }) => {
    const { meta, payload } = envelope

    // Metriport's set of types is open and grows without asking. Not ours: no
    // record, so no subject is resolved and no patient is minted.
    if (!isAdtWebhookType(meta.type)) return []

    // Strict from here on: the type is one we handle, so a malformed payload is
    // a real problem and must not be swallowed by the acknowledge path above.
    if (isNil(payload)) {
      throw new PayloadError(`${meta.type} notification carries no payload`)
    }

    const bundle = await fetchBundle(payload.url)
    const encounter = findEncounter(bundle)
    const visitId = isNil(encounter) ? undefined : visitIdFrom(encounter)
    if (isNil(visitId)) {
      throw new PayloadError(
        `${meta.type} bundle at ${payload.url} carries no Encounter to key the visit on`,
      )
    }

    return [
      {
        event: meta.type,
        messageId: meta.messageId,
        externalId: payload.externalId,
        metriportPatientId: payload.patientId,
        visitId,
        admittedAt: payload.admitTimestamp ?? encounter?.period?.start,
        dischargedAt: payload.dischargeTimestamp ?? encounter?.period?.end,
        location: payload.transfers?.at(-1)?.destinationLocation,
        bundle,
      },
    ]
  },
  identity: {
    // The extension's own `identifier.system`. The SDK still requires it here;
    // once `identity.system` is optional in extensions-core the runtime
    // defaults it from the extension and this line goes.
    system: METRIPORT_IDENTIFIER_SYSTEM,
    // `externalId` is the id the patient was created in Metriport with, not
    // Metriport's UUID, so every other feed about the patient matches on it.
    resolveValue: (record) => record.externalId,
  },
  run: async ({ record, store, events }) => {
    store.save('patient', demographicsFrom(record.bundle))

    const closed =
      record.event === MetriportWebhookType.PatientDischarge ||
      record.event === MetriportWebhookType.DischargeSummary

    // Upsert key: every message about this visit converges on ONE encounter.
    // Only what this message knows is written: an admit carries no discharge
    // time and a discharge no location, and neither should clear what an
    // earlier message about the same visit already set.
    store.save(
      'encounter',
      omitBy(
        {
          identifier: {
            system: METRIPORT_ENCOUNTER_IDENTIFIER_SYSTEM,
            value: record.visitId,
          },
          status: closed ? 'finished' : 'in-progress',
          startedAt: record.admittedAt,
          endedAt: record.dischargedAt,
          location: record.location,
        },
        isUndefined,
      ),
    )

    // Every handled message carries a bundle, so every record says so. This is
    // what FHIR data movement listens for; it looks the bundle up from
    // retention by the ingestion id, so the event carries nothing else.
    events.publish({ key: 'fhir.bundle-received' })

    // `record.event` is our union, not Metriport's: getRecords already dropped
    // what we do not handle, so this switch is genuinely closed.
    switch (record.event) {
      case MetriportWebhookType.PatientAdmit:
        events.publish({ key: 'patient.admitted' })
        break
      case MetriportWebhookType.PatientTransfer:
        events.publish({ key: 'patient.transferred' })
        break
      case MetriportWebhookType.PatientDischarge:
        events.publish({ key: 'patient.discharged' })
        break
      case MetriportWebhookType.DischargeSummary:
        // Same envelope, supplemental bundle: more detail about a discharge
        // already recorded, converging on the same encounter. The document
        // itself is not modelled yet; it is reachable through the retained
        // bundle.
        events.publish({ key: 'document.available' })
        break
      default:
        unhandled(record.event)
    }
  },
})
