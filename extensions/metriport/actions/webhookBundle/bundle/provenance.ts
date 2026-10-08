import {
  type BundleEntry,
  type CodeableConcept,
  type Coding,
  type Provenance,
} from '@medplum/fhirtypes'
import {
  ACCOUNT_ORGANIZATION_FULL_URL,
  METRIPORT_BUNDLE_IDENTIFIER_SYSTEM,
  PROVENANCE_FULL_URL,
} from './constants'

const HL7_EVENT_TYPE_SYSTEM = 'http://terminology.hl7.org/CodeSystem/v2-0003'

/**
 * Metriport's ADT notification types map onto the HL7 v2 event codes they
 * originate from, so admission vs. discharge is derived from the webhook rather
 * than configured by hand.
 */
const ACTIVITY_BY_EVENT_TYPE: Record<string, CodeableConcept> = {
  'patient.admit': {
    coding: [
      {
        system: HL7_EVENT_TYPE_SYSTEM,
        code: 'A01',
        display: 'ADT/ACK - Admit/visit notification',
      },
    ],
  },
  'patient.transfer': {
    coding: [
      {
        system: HL7_EVENT_TYPE_SYSTEM,
        code: 'A02',
        display: 'ADT/ACK - Transfer a patient',
      },
    ],
  },
  'patient.discharge': {
    coding: [
      {
        system: HL7_EVENT_TYPE_SYSTEM,
        code: 'A03',
        display: 'ADT/ACK - Discharge/end visit',
      },
    ],
  },
}

export const eventTypeToActivity = (
  eventType: string | undefined,
): CodeableConcept | undefined =>
  eventType === undefined ? undefined : ACTIVITY_BY_EVENT_TYPE[eventType]

/**
 * Builds the Provenance entry recording this import, so a care flow can trace
 * every resource back to the Metriport notification that produced it.
 *
 * POST rather than a conditional update: Provenance has no `identifier` element
 * in FHIR R4, and each delivery is a distinct import event.
 *
 * With an `idempotencyTag` it is a conditional update on that tag instead, for
 * an import that is sent in several bundles and is rerun after a failure part
 * way: the rerun replaces the Provenance of a chunk rather than adding another.
 */
export const buildProvenance = ({
  targetReferences,
  sourceBundleId,
  recorded,
  reason,
  eventType,
  idempotencyTag,
}: {
  targetReferences: string[]
  sourceBundleId: string | undefined
  recorded: string
  reason?: string
  eventType?: string
  idempotencyTag?: Required<Pick<Coding, 'system' | 'code'>>
}): BundleEntry<Provenance> => {
  const activity = eventTypeToActivity(eventType)

  const provenance: Provenance = {
    resourceType: 'Provenance',
    ...(idempotencyTag !== undefined ? { meta: { tag: [idempotencyTag] } } : {}),
    target: targetReferences.map((reference) => ({ reference })),
    recorded,
    agent: [
      {
        type: {
          coding: [
            {
              system:
                'http://terminology.hl7.org/CodeSystem/provenance-participant-type',
              code: 'assembler',
              display: 'Assembler',
            },
          ],
        },
        who: { reference: ACCOUNT_ORGANIZATION_FULL_URL },
      },
    ],
    entity: [
      {
        role: 'source',
        what: {
          identifier: {
            system: METRIPORT_BUNDLE_IDENTIFIER_SYSTEM,
            value: sourceBundleId,
          },
        },
      },
    ],
    ...(reason !== undefined && reason !== ''
      ? { reason: [{ text: reason }] }
      : {}),
    ...(activity !== undefined ? { activity } : {}),
  }

  return {
    fullUrl: PROVENANCE_FULL_URL,
    resource: provenance,
    request:
      idempotencyTag === undefined
        ? { method: 'POST', url: 'Provenance' }
        : {
            method: 'PUT',
            url: `Provenance?_tag=${idempotencyTag.system}|${idempotencyTag.code}`,
          },
  }
}
