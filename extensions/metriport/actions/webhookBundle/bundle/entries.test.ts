import { buildResourceEntry } from './entries'
import { metriportIdentifierSystem } from './constants'

describe('buildResourceEntry', () => {
  test('writes the resource with a conditional update on its Metriport identifier', () => {
    const entry = buildResourceEntry({
      resourceType: 'Condition',
      id: 'metriport-condition-1',
      subject: { reference: 'Patient/metriport-patient-1' },
      code: { text: 'Stable Angina' },
    })

    expect(entry.request).toEqual({
      method: 'PUT',
      url: 'Condition?identifier=https://metriport.com/fhir/condition|metriport-condition-1',
    })
  })

  test('stamps the Metriport identifier onto the resource', () => {
    const entry = buildResourceEntry({
      resourceType: 'Condition',
      id: 'metriport-condition-1',
      subject: { reference: 'Patient/metriport-patient-1' },
    })

    expect((entry.resource as any).identifier).toEqual([
      {
        system: metriportIdentifierSystem('Condition'),
        value: 'metriport-condition-1',
      },
    ])
  })

  test('appends to existing identifiers rather than replacing them', () => {
    const entry = buildResourceEntry({
      resourceType: 'Encounter',
      id: 'metriport-encounter-1',
      status: 'in-progress',
      class: { code: 'AMB' },
      identifier: [{ value: '987654321' }],
    })

    expect((entry.resource as any).identifier).toEqual([
      { value: '987654321' },
      {
        system: metriportIdentifierSystem('Encounter'),
        value: 'metriport-encounter-1',
      },
    ])
  })

  test('does not stamp a duplicate identifier when one is already present', () => {
    const entry = buildResourceEntry({
      resourceType: 'Encounter',
      id: 'metriport-encounter-1',
      status: 'in-progress',
      class: { code: 'AMB' },
      identifier: [
        {
          system: metriportIdentifierSystem('Encounter'),
          value: 'metriport-encounter-1',
        },
      ],
    })

    expect((entry.resource as any).identifier).toHaveLength(1)
  })

  test("passes through Metriport's fullUrl as the local identity", () => {
    const entry = buildResourceEntry(
      { resourceType: 'Location', id: 'metriport-location-1' },
      'urn:uuid:3ca5e8d2-7c84-45ab-91e7-834f8becde12',
    )

    expect(entry.fullUrl).toBe('urn:uuid:3ca5e8d2-7c84-45ab-91e7-834f8becde12')
  })

  test('falls back to the urn form when the entry carries no fullUrl', () => {
    const entry = buildResourceEntry({
      resourceType: 'Location',
      id: 'metriport-location-1',
    })

    expect(entry.fullUrl).toBe('urn:uuid:metriport-location-1')
  })

  test('strips the Metriport id, since the server assigns identity', () => {
    const entry = buildResourceEntry({
      resourceType: 'Location',
      id: 'metriport-location-1',
    })

    expect(entry.resource?.id).toBeUndefined()
  })

  test('strips meta, so Medplum account inheritance is not overwritten', () => {
    const entry = buildResourceEntry({
      resourceType: 'Encounter',
      id: 'metriport-encounter-1',
      status: 'in-progress',
      class: { code: 'AMB' },
      meta: {
        versionId: '0.1.0',
        extension: [
          {
            url: 'https://api.metriport.com/created-at',
            valueInstant: '2025-03-15T16:45:10.000+00:00',
          },
        ],
      },
    })

    expect(entry.resource?.meta).toBeUndefined()
  })

  test('falls back to POST for resource types with no identifier element', () => {
    const entry = buildResourceEntry({
      resourceType: 'Binary',
      id: 'metriport-binary-1',
      contentType: 'application/pdf',
    })

    expect(entry.request).toEqual({ method: 'POST', url: 'Binary' })
    expect((entry.resource as any).identifier).toBeUndefined()
  })

  test('does not mutate the resource it is given', () => {
    const resource = {
      resourceType: 'Location' as const,
      id: 'metriport-location-1',
      meta: { versionId: '0.1.0' },
    }

    buildResourceEntry(resource)

    expect(resource.id).toBe('metriport-location-1')
    expect(resource.meta).toEqual({ versionId: '0.1.0' })
  })
})
