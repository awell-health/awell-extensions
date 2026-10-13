import { type Bundle, type Encounter } from '@medplum/fhirtypes'
import { extractEncounterFields, findEncounterId } from './encounter'
import { patientAdmitBundle } from './__testdata__/patientAdmitBundle'

describe('findEncounterId', () => {
  test('Should return the id of the Encounter in a patient encounter bundle', () => {
    expect(findEncounterId(patientAdmitBundle)).toBe(
      'c60544e1-2e37-45fb-8160-3d583902cfde',
    )
  })

  test('Should return undefined when the bundle has no Encounter', () => {
    const bundle: Bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      entry: [{ resource: { resourceType: 'Patient', id: 'p1' } }],
    }

    expect(findEncounterId(bundle)).toBeUndefined()
  })

  test('Should return undefined when the bundle has no entries', () => {
    expect(
      findEncounterId({ resourceType: 'Bundle', type: 'searchset' }),
    ).toBeUndefined()
  })

  test('Should return undefined when the Encounter has no id', () => {
    const bundle: Bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      entry: [
        {
          resource: {
            resourceType: 'Encounter',
            status: 'finished',
            class: { code: 'IMP' },
          },
        },
      ],
    }

    expect(findEncounterId(bundle)).toBeUndefined()
  })

  test('Should return the first Encounter when the bundle carries several', () => {
    const bundle: Bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      entry: [
        {
          resource: {
            resourceType: 'Encounter',
            id: 'enc-1',
            status: 'finished',
            class: { code: 'IMP' },
          },
        },
        {
          resource: {
            resourceType: 'Encounter',
            id: 'enc-2',
            status: 'finished',
            class: { code: 'IMP' },
          },
        },
      ],
    }

    expect(findEncounterId(bundle)).toBe('enc-1')
  })
})

describe('extractEncounterFields', () => {
  const bundleWith = (
    encounter: Partial<Encounter>,
    ...others: NonNullable<Bundle['entry']>
  ): Bundle => ({
    resourceType: 'Bundle',
    type: 'collection',
    entry: [
      {
        resource: {
          resourceType: 'Encounter',
          status: 'finished',
          class: { code: 'IMP' },
          ...encounter,
        },
      },
      ...others,
    ],
  })

  test('Should return the fields of the Encounter in a patient encounter bundle', () => {
    expect(extractEncounterFields(patientAdmitBundle)).toEqual({
      admissionDatetime: '2024-07-22T19:50:00.000Z',
      encounterClass: 'Ambulatory',
      encounterLocation: 'Memorial Hospital',
      encounterReason: 'Chest pain',
      encounterDiagnoses: JSON.stringify(['Stable Angina']),
    })
  })

  test('Should read the location name from the Location in the bundle', () => {
    const fields = extractEncounterFields(
      bundleWith(
        { location: [{ location: { reference: 'Location/loc-1' } }] },
        {
          fullUrl: 'urn:uuid:loc-1',
          resource: { resourceType: 'Location', id: 'loc-1', name: 'Clinic A' },
        },
      ),
    )

    expect(fields.encounterLocation).toBe('Clinic A')
  })

  test('Should fall back to the reference display when the Location is not in the bundle', () => {
    const fields = extractEncounterFields(
      bundleWith({
        location: [
          { location: { reference: 'Location/gone', display: 'Clinic B' } },
        ],
      }),
    )

    expect(fields.encounterLocation).toBe('Clinic B')
  })

  test('Should return nothing when the bundle has no Encounter', () => {
    expect(
      extractEncounterFields({ resourceType: 'Bundle', type: 'searchset' }),
    ).toEqual({})
  })

  test('Should return the admission and discharge datetimes from the period', () => {
    const fields = extractEncounterFields(
      bundleWith({
        period: {
          start: '2024-07-22T19:50:00.000Z',
          end: '2024-07-25T10:00:00.000Z',
        },
      }),
    )

    expect(fields.admissionDatetime).toBe('2024-07-22T19:50:00.000Z')
    expect(fields.dischargeDatetime).toBe('2024-07-25T10:00:00.000Z')
  })

  test('Should return the first type whose text partially matches a known type', () => {
    const fields = extractEncounterFields(
      bundleWith({
        type: [
          { text: 'Office visit' },
          { coding: [{ code: 'IMP' }] },
          { text: 'Emergency department visit' },
          { text: 'Inpatient' },
        ],
      }),
    )

    expect(fields.encounterType).toBe('Emergency department visit')
  })

  test('Should match a type regardless of case', () => {
    expect(
      extractEncounterFields(bundleWith({ type: [{ text: 'INPATIENT STAY' }] }))
        .encounterType,
    ).toBe('INPATIENT STAY')
  })

  test('Should omit the type when none matches a known type', () => {
    expect(
      extractEncounterFields(bundleWith({ type: [{ text: 'Office visit' }] })),
    ).not.toHaveProperty('encounterType')
  })

  test.each([
    ['missing', {}],
    ['empty', { display: '' }],
    ['unknown', { display: 'unknown' }],
    ['Unknown in another case', { display: 'UNKNOWN' }],
  ])(
    'Should fall back to the type for the class when the class is %s',
    (_, encounterClass) => {
      const fields = extractEncounterFields(
        bundleWith({
          class: encounterClass,
          type: [{ text: 'Office visit' }, { text: 'Inpatient stay' }],
        }),
      )

      expect(fields.encounterClass).toBe('Inpatient stay')
      expect(fields.encounterType).toBe('Inpatient stay')
    },
  )

  test('Should keep a known class over the type', () => {
    const fields = extractEncounterFields(
      bundleWith({
        class: { display: 'Ambulatory' },
        type: [{ text: 'Inpatient stay' }],
      }),
    )

    expect(fields.encounterClass).toBe('Ambulatory')
  })

  test('Should omit the class when it is unknown and no type matches', () => {
    expect(
      extractEncounterFields(
        bundleWith({
          class: { display: 'unknown' },
          type: [{ text: 'Office visit' }],
        }),
      ),
    ).not.toHaveProperty('encounterClass')
  })

  test('Should list every diagnosis, falling back to the Condition in the bundle', () => {
    const fields = extractEncounterFields(
      bundleWith(
        {
          diagnosis: [
            { condition: { reference: 'Condition/c1', display: 'Sepsis' } },
            { condition: { reference: 'Condition/c2' } },
            { condition: { reference: 'Condition/not-in-bundle' } },
          ],
        },
        {
          resource: {
            resourceType: 'Condition',
            id: 'c2',
            subject: { reference: 'Patient/p1' },
            code: { text: 'Pneumonia' },
          },
        },
      ),
    )

    expect(fields.encounterDiagnoses).toBe(
      JSON.stringify(['Sepsis', 'Pneumonia']),
    )
  })

  test('Should omit every field the Encounter does not carry', () => {
    expect(extractEncounterFields(bundleWith({ class: {} }))).toEqual({})
  })
})
