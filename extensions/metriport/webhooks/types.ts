import { type Bundle } from '@medplum/fhirtypes'

/**
 * The type of Metriport real-time patient notification.
 *
 * Metriport delivers HL7v2 ADT notifications as one of the following webhook
 * types. See:
 * https://docs.metriport.com/medical-api/handling-data/realtime-patient-notifications
 */
export enum MetriportWebhookType {
  Ping = 'ping',
  PatientAdmit = 'patient.admit',
  PatientDischarge = 'patient.discharge',
  PatientTransfer = 'patient.transfer',
}

/**
 * The event type surfaced to the care flow as a data point so it can be
 * distinguished on. We are interested in two of them for enrollment:
 *  - `adt`: the patient was admitted (HL7 ADT^A01)
 *  - `discharge`: the patient was discharged (HL7 ADT^A03)
 */
export enum EnrollmentEventType {
  Adt = 'adt',
  Discharge = 'discharge',
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
 * Payload shared by the ADT notification webhook types (admit / discharge /
 * transfer). `url` is a pre-signed link to the FHIR Encounter Bundle and is
 * only valid for 10 minutes.
 * https://docs.metriport.com/medical-api/handling-data/patient-encounter-bundle
 */
export interface MetriportAdtEventPayload {
  url: string
  patientId: string
  externalId?: string
  additionalIds?: Record<string, string[]>
  admitTimestamp: string
  dischargeTimestamp?: string
  whenSourceSent?: string
}

export interface MetriportPatientAdmitWebhook {
  meta: MetriportWebhookMeta & { type: MetriportWebhookType.PatientAdmit }
  payload: MetriportAdtEventPayload
}

export interface MetriportPatientDischargeWebhook {
  meta: MetriportWebhookMeta & { type: MetriportWebhookType.PatientDischarge }
  payload: MetriportAdtEventPayload & { dischargeTimestamp: string }
}

export interface MetriportPatientTransferWebhook {
  meta: MetriportWebhookMeta & { type: MetriportWebhookType.PatientTransfer }
  payload: MetriportAdtEventPayload
}

export interface MetriportPingWebhook {
  meta: MetriportWebhookMeta & { type: MetriportWebhookType.Ping }
  ping: string
}

/**
 * The union of all payloads that can be received on the enrollment webhook
 * endpoint. Metriport POSTs every notification type to the same URL, so the
 * handler must discriminate on `meta.type`.
 */
export type MetriportEnrollmentWebhookPayload =
  | MetriportPatientAdmitWebhook
  | MetriportPatientDischargeWebhook
  | MetriportPatientTransferWebhook
  | MetriportPingWebhook

/**
 * The FHIR Encounter Bundle referenced by the notification `url`.
 * https://docs.metriport.com/medical-api/handling-data/patient-encounter-bundle
 */
export type EncounterBundle = Bundle
