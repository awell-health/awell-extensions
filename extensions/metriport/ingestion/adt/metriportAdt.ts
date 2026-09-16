import {
  PayloadValidationError,
  unhandled,
  withSettings,
} from '@awell-health/extensions-core'
import { isNil, isUndefined, omitBy } from 'lodash'
import { fetchBundle } from '../../shared/fetchBundle'
import { type settings } from '../../settings'
import { MetriportWebhookType } from '../../webhooks/types'
import { isAdtWebhookType } from '../../webhooks/validation.zod'
import { findEncounter, visitIdFrom } from './bundle'
import { encounterDetailsFrom } from './encounter'
import { saveLinkedResources } from './links'
import { adtRecordSchema, notificationSchema } from './schemas'

export const METRIPORT_ENCOUNTER_IDENTIFIER_SYSTEM =
  'https://metriport.com/encounter'

/**
 * Metriport posts every real-time notification to one URL, discriminated on
 * `meta.type`, with the clinical data behind a presigned `payload.url` (a FHIR
 * bundle, valid for 600 s). Admit, transfer, discharge and the discharge
 * summary all converge on one encounter keyed on the visit.
 *
 * The Encounter is the hub. Every resource it points at — the Location it
 * happened in, the Practitioners who took part, the Conditions it diagnosed —
 * is saved as an object of its own and linked from the Encounter, keyed on
 * Metriport's resource id so redelivery upserts. The patient is created by
 * identifier resolution and its demographics are not written yet; the
 * discharge summary document is modelled later. The bundle itself is retained
 * by the runtime and reaches FHIR data movement through
 * `fhir.bundle-received`, so what is simplified here is the Awell view of the
 * visit, never the record of it.
 * https://docs.metriport.com/medical-api/handling-data/realtime-patient-notifications
 */
export const metriportAdt = withSettings<typeof settings>().endpoint({
  key: 'metriportAdt',
  title: 'Metriport ADT notifications',
  description:
    'Receives Metriport real-time patient notifications. Handles `patient.admit`, `patient.transfer`, `patient.discharge` and `medical.discharge-summary`, downloading the FHIR bundle each points at; any other notification type is acknowledged without producing a record.',
  source: 'webhook',
  // TODO: enable verification after the pre-release: `import { verify } from './verify'`
  // and set `verify` here. The verifier and its tests are kept in verify.ts.
  schema: { envelope: notificationSchema, payload: adtRecordSchema },
  getRecords: async ({ envelope }) => {
    const { meta, payload } = envelope

    // Metriport's set of types is open and grows without asking. Not ours: no
    // record, so no subject is resolved and no patient is minted.
    if (!isAdtWebhookType(meta.type)) return []

    // Strict from here on: the type is one we handle, so a malformed payload is
    // a real problem and must not be swallowed by the acknowledge path above.
    if (isNil(payload)) {
      throw new PayloadValidationError(
        `${meta.type} notification carries no payload`,
      )
    }

    const bundle = await fetchBundle(payload.url)
    const encounter = findEncounter(bundle)
    const visitId = isNil(encounter) ? undefined : visitIdFrom(encounter)
    if (isNil(encounter) || isNil(visitId)) {
      throw new PayloadValidationError(
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
        admittedAt: payload.admitTimestamp ?? encounter.period?.start,
        dischargedAt: payload.dischargeTimestamp ?? encounter.period?.end,
        location: payload.transfers?.at(-1)?.destinationLocation,
        // Everything the Encounter points at, resolved here rather than in
        // `run`: the bundle digging belongs on this side, and what comes out
        // is validated by the record schema and retained for replay.
        ...encounterDetailsFrom(bundle, encounter),
        bundle,
      },
    ]
  },
  // No `system`: the runtime defaults it to the extension's `identifier.system`.
  // `externalId` is the id the patient was created in Metriport with, not
  // Metriport's UUID, so every other feed about the patient matches on it.
  identifier: { resolveValue: (record) => record.externalId },
  run: async ({ record, store, events }) => {
    const closed =
      record.event === MetriportWebhookType.PatientDischarge ||
      record.event === MetriportWebhookType.DischargeSummary

    // Saved before the Encounter, because the Encounter is the hub: it links
    // to them, and a link needs the Awell id the save hands back.
    const { locations, participants, diagnoses } = saveLinkedResources(
      store,
      record,
    )

    // Upsert key: every message about this visit converges on ONE encounter.
    // Only what this message knows is written: an admit carries no discharge
    // time and a discharge no location, and neither should clear what an
    // earlier message about the same visit already set.
    store.save(
      'Encounter',
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
          class: record.class,
          serviceType: record.serviceType,
          reason: record.reason,
          locations,
          participants,
          diagnoses,
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
        events.publish({ key: 'discharge.summary-received' })
        break
      default:
        unhandled(record.event)
    }
  },
})
