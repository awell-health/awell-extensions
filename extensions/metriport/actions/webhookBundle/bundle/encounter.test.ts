import { type Bundle } from '@medplum/fhirtypes'
import { findEncounterId } from './encounter'
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
