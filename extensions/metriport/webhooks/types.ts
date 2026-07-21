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
   * Discharge summary notification. Currently undocumented by Metriport but
   * modelled on the published `medical.*` webhook family (a `patients` array).
   */
  DischargeSummary = 'medical.discharge-summary',
}

/**
 * The event type surfaced to the care flow as a data point so it can be
 * distinguished on. We enroll on two of them:
 *  - `adt`: the patient was admitted (`patient.admit`, HL7 ADT^A01)
 *  - `discharge`: a discharge summary was produced (`medical.discharge-summary`)
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

/**
 * A single patient entry as delivered by the `medical.*` webhook family. The
 * discharge summary FHIR data may be embedded inline (`bundle`, as in
 * `medical.consolidated-data`) or referenced by a pre-signed `url`. Unknown
 * fields are preserved so nothing is lost while the event is undocumented.
 */
export interface MetriportMedicalPatientEntry {
  patientId: string
  externalId?: string
  additionalIds?: Record<string, string[]>
  status?: string
  bundle?: Bundle
  url?: string
  [key: string]: unknown
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

export interface MetriportDischargeSummaryWebhook {
  meta: MetriportWebhookMeta & { type: MetriportWebhookType.DischargeSummary }
  patients?: MetriportMedicalPatientEntry[]
  /** Some notifications may carry a single top-level payload instead. */
  payload?: MetriportAdtEventPayload
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
  | MetriportDischargeSummaryWebhook
  | MetriportPingWebhook

/**
 * The FHIR Encounter Bundle referenced by an ADT notification `url`.
 * https://docs.metriport.com/medical-api/handling-data/patient-encounter-bundle
 */
export type EncounterBundle = Bundle
