import { type Bundle } from '@medplum/fhirtypes'

/**
 * The type of Metriport real-time patient notification.
 *
 * Metriport delivers HL7v2 ADT notifications under the `patient.*` family and
 * document/data notifications under the `medical.*` family. See:
 * https://docs.metriport.com/medical-api/handling-data/realtime-patient-notifications
 */
export enum MetriportWebhookType {
  Ping = 'ping',
  /** HL7 ADT^A01 admit notification (Encounter Bundle via a pre-signed URL). */
  PatientAdmit = 'patient.admit',
  /** HL7 ADT^A03 discharge notification. */
  PatientDischarge = 'patient.discharge',
  /** HL7 ADT^A02 transfer notification. */
  PatientTransfer = 'patient.transfer',
  /**
   * Discharge summary notification. Undocumented by Metriport, but delivered
   * with the same envelope and payload as the `patient.*` family.
   */
  DischargeSummary = 'medical.discharge-summary',
}

/**
 * Metadata present on every Metriport webhook request.
 */
export interface MetriportWebhookMeta {
  messageId: string
  when: string
  type: MetriportWebhookType
  requestId?: string
  /** The metadata sent by the customer when they triggered the operation. */
  data?: unknown
}

/**
 * The payload shared by every real-time notification we enroll on. `url` is a
 * pre-signed link to the FHIR bundle and is only valid for 10 minutes.
 *
 * Metriport also sends per-event timestamps (`admitTimestamp`,
 * `dischargeTimestamp`, `whenSourceSent`); they are not modelled here because
 * `meta.when` already carries the event's timestamp and nothing downstream
 * consumes the others.
 * https://docs.metriport.com/medical-api/handling-data/patient-encounter-bundle
 */
export interface MetriportRealtimeNotificationPayload {
  url: string
  patientId: string
  externalId?: string
  additionalIds?: Record<string, string[]>
}

/**
 * An ADT or discharge-summary notification. All four types share one shape, so
 * `meta.type` is the only thing that distinguishes them.
 */
export interface MetriportRealtimeNotificationWebhook {
  meta: MetriportWebhookMeta
  payload: MetriportRealtimeNotificationPayload
}

export interface MetriportPingWebhook {
  meta: MetriportWebhookMeta & { type: MetriportWebhookType.Ping }
  ping: string
}

/**
 * The union of all payloads that can be received on the realtime update webhook
 * endpoint. Metriport POSTs every notification type to the same URL, so the
 * handler discriminates on `meta.type` and acknowledges anything it does not
 * enroll on.
 */
export type MetriportRealtimeUpdateWebhookPayload =
  | MetriportRealtimeNotificationWebhook
  | MetriportPingWebhook

/**
 * The FHIR Encounter Bundle referenced by an ADT notification `url`.
 * https://docs.metriport.com/medical-api/handling-data/patient-encounter-bundle
 */
export type EncounterBundle = Bundle
