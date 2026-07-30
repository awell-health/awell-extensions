import { buildProvenance, eventTypeToActivity } from './provenance'
import {
  ACCOUNT_ORGANIZATION_FULL_URL,
  METRIPORT_BUNDLE_IDENTIFIER_SYSTEM,
  PROVENANCE_FULL_URL,
} from './constants'

describe('eventTypeToActivity', () => {
  test('maps patient.admit to the A01 admit event code', () => {
    expect(eventTypeToActivity('patient.admit')).toEqual({
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v2-0003',
          code: 'A01',
          display: 'ADT/ACK - Admit/visit notification',
        },
      ],
    })
  })

  test('maps patient.transfer to A02', () => {
    expect(eventTypeToActivity('patient.transfer')?.coding?.[0].code).toBe(
      'A02',
    )
  })

  test('maps patient.discharge to A03', () => {
    expect(eventTypeToActivity('patient.discharge')?.coding?.[0].code).toBe(
      'A03',
    )
  })

  test('returns undefined for an unrecognised event type', () => {
    expect(eventTypeToActivity('medical.consolidated-data')).toBeUndefined()
  })

  test('returns undefined when no event type is given', () => {
    expect(eventTypeToActivity(undefined)).toBeUndefined()
  })
})

describe('buildProvenance', () => {
  const targets = ['urn:uuid:encounter-1', 'urn:uuid:condition-1']

  test('is a POST entry, since Provenance has no identifier element', () => {
    const entry = buildProvenance({
      targetReferences: targets,
      sourceBundleId: 'bundle-1',
      recorded: '2025-03-15T16:45:10.000Z',
    })

    expect(entry.fullUrl).toBe(PROVENANCE_FULL_URL)
    expect(entry.request).toEqual({ method: 'POST', url: 'Provenance' })
  })

  test('targets every reference it is given', () => {
    const entry = buildProvenance({
      targetReferences: targets,
      sourceBundleId: 'bundle-1',
      recorded: '2025-03-15T16:45:10.000Z',
    })

    expect(entry.resource).toMatchObject({
      resourceType: 'Provenance',
      target: [
        { reference: 'urn:uuid:encounter-1' },
        { reference: 'urn:uuid:condition-1' },
      ],
    })
  })

  test('records the account Organization as the assembling agent', () => {
    const entry = buildProvenance({
      targetReferences: targets,
      sourceBundleId: 'bundle-1',
      recorded: '2025-03-15T16:45:10.000Z',
    })

    expect((entry.resource as any).agent).toEqual([
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
    ])
  })

  test('records the source bundle id as the entity', () => {
    const entry = buildProvenance({
      targetReferences: targets,
      sourceBundleId: 'bundle-1',
      recorded: '2025-03-15T16:45:10.000Z',
    })

    expect((entry.resource as any).entity).toEqual([
      {
        role: 'source',
        what: {
          identifier: {
            system: METRIPORT_BUNDLE_IDENTIFIER_SYSTEM,
            value: 'bundle-1',
          },
        },
      },
    ])
  })

  test('sets recorded from the value it is given', () => {
    const entry = buildProvenance({
      targetReferences: targets,
      sourceBundleId: 'bundle-1',
      recorded: '2025-03-15T16:45:10.000Z',
    })

    expect((entry.resource as any).recorded).toBe('2025-03-15T16:45:10.000Z')
  })

  test('includes the reason as free text when given', () => {
    const entry = buildProvenance({
      targetReferences: targets,
      sourceBundleId: 'bundle-1',
      recorded: '2025-03-15T16:45:10.000Z',
      reason: 'Inpatient admission notification',
    })

    expect((entry.resource as any).reason).toEqual([
      { text: 'Inpatient admission notification' },
    ])
  })

  test('omits reason entirely when not given', () => {
    const entry = buildProvenance({
      targetReferences: targets,
      sourceBundleId: 'bundle-1',
      recorded: '2025-03-15T16:45:10.000Z',
    })

    expect((entry.resource as any).reason).toBeUndefined()
  })

  test('includes the activity derived from the event type', () => {
    const entry = buildProvenance({
      targetReferences: targets,
      sourceBundleId: 'bundle-1',
      recorded: '2025-03-15T16:45:10.000Z',
      eventType: 'patient.discharge',
    })

    expect((entry.resource as any).activity?.coding?.[0].code).toBe('A03')
  })

  test('omits activity when the event type is unrecognised', () => {
    const entry = buildProvenance({
      targetReferences: targets,
      sourceBundleId: 'bundle-1',
      recorded: '2025-03-15T16:45:10.000Z',
      eventType: 'ping',
    })

    expect((entry.resource as any).activity).toBeUndefined()
  })

  test('carries no meta, so Medplum account inheritance applies', () => {
    const entry = buildProvenance({
      targetReferences: targets,
      sourceBundleId: 'bundle-1',
      recorded: '2025-03-15T16:45:10.000Z',
    })

    expect(entry.resource?.meta).toBeUndefined()
  })
})
