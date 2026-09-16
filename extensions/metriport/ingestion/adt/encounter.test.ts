import { type Bundle, type Encounter } from '@medplum/fhirtypes'
import {
  METRIPORT_CONDITION_ID,
  METRIPORT_LOCATION_ID,
  METRIPORT_PRACTITIONER_ID,
  patientAdmitBundle,
} from '../../actions/webhookBundle/bundle/__testdata__/patientAdmitBundle'
import { findEncounter } from './bundle'
import { encounterDetailsFrom } from './encounter'
import { dischargeSummaryBundle } from './__testdata__/dischargeSummaryBundle'

const detailsOf = (bundle: Bundle): ReturnType<typeof encounterDetailsFrom> =>
  encounterDetailsFrom(bundle, findEncounter(bundle)!)

describe('Metriport - Ingestion - ADT encounter details', () => {
  describe('the encounter itself', () => {
    test('keeps the class as its code, since v3-ActCode is the only system FHIR allows there', () => {
      expect(detailsOf(patientAdmitBundle).class).toBe('AMB')
    })

    test('keeps the service type whole, since Metriport sends it without a system', () => {
      expect(detailsOf(patientAdmitBundle).serviceType).toEqual({
        codes: [{ code: '394592004', display: 'Cardiology' }],
        text: 'Cardiology',
      })
    })

    test('takes the reason as the text a clinician would read', () => {
      expect(detailsOf(patientAdmitBundle).reason).toBe('Chest pain')
    })
  })

  describe('the resources the encounter points at', () => {
    test('pulls the location off the encounter', () => {
      expect(detailsOf(patientAdmitBundle).locations).toEqual([
        {
          metriportId: METRIPORT_LOCATION_ID,
          name: 'Memorial Hospital',
          status: 'active',
          type: 'HOSP',
        },
      ])
    })

    test('pulls the practitioner off the encounter with the role they played in it', () => {
      expect(detailsOf(patientAdmitBundle).practitioners).toEqual([
        {
          metriportId: METRIPORT_PRACTITIONER_ID,
          name: 'Dr. Maria Rodriguez',
          prefix: 'Dr.',
          given: 'Maria',
          family: 'Rodriguez',
          qualifications: ['MD'],
          encounter: { role: 'ATND', startedAt: '2024-03-15T14:20:00.000Z' },
        },
      ])
    })

    test('pulls the diagnosed condition off the encounter with its rank and use', () => {
      expect(detailsOf(patientAdmitBundle).conditions).toEqual([
        {
          metriportId: METRIPORT_CONDITION_ID,
          text: 'Stable Angina',
          codes: [
            {
              system: 'http://snomed.info/sct',
              code: '194828000',
              display: 'Stable angina',
            },
          ],
          clinicalStatus: 'active',
          verificationStatus: 'confirmed',
          category: 'encounter-diagnosis',
          onsetAt: '2024-03-15T14:20:00.000Z',
          recordedAt: '2024-03-15T16:45:00.000Z',
          encounter: { use: 'AD', rank: 1 },
        },
      ])
    })

    test('carries the period an encounter gives a location, when it gives one', () => {
      const encounter: Encounter = {
        ...findEncounter(patientAdmitBundle)!,
        location: [
          {
            location: { reference: `Location/${METRIPORT_LOCATION_ID}` },
            period: {
              start: '2024-07-22T19:50:00.000Z',
              end: '2024-07-25T14:10:00.000Z',
            },
          },
        ],
      }

      expect(
        encounterDetailsFrom(patientAdmitBundle, encounter).locations?.[0]
          .encounter,
      ).toEqual({
        startedAt: '2024-07-22T19:50:00.000Z',
        endedAt: '2024-07-25T14:10:00.000Z',
      })
    })
  })

  describe('what a bundle does not carry', () => {
    test('a bundle of nothing but patient and encounter yields no resources to save', () => {
      const details = detailsOf(dischargeSummaryBundle)

      expect(details.locations).toBeUndefined()
      expect(details.practitioners).toBeUndefined()
      expect(details.conditions).toBeUndefined()
    })

    test('a reference the bundle does not contain is dropped rather than saved hollow', () => {
      const encounter: Encounter = {
        ...findEncounter(patientAdmitBundle)!,
        location: [{ location: { reference: 'Location/not-in-this-bundle' } }],
      }

      expect(
        encounterDetailsFrom(patientAdmitBundle, encounter).locations,
      ).toBeUndefined()
    })

    test('a diagnosis pointing at a procedure rather than a condition is left alone', () => {
      const bundle: Bundle = {
        ...patientAdmitBundle,
        entry: [
          ...(patientAdmitBundle.entry ?? []),
          {
            fullUrl: 'urn:uuid:proc-1',
            resource: {
              resourceType: 'Procedure',
              id: 'proc-1',
              status: 'completed',
              subject: {
                reference: 'Patient/78a4d9e5-f2b3-42c8-9a84-52f3e21c2b9d',
              },
            },
          },
        ],
      }
      const encounter: Encounter = {
        ...findEncounter(patientAdmitBundle)!,
        diagnosis: [{ condition: { reference: 'Procedure/proc-1' } }],
      }

      expect(encounterDetailsFrom(bundle, encounter).conditions).toBeUndefined()
    })

    test('references the same resource twice only once, so a save is never duplicated', () => {
      const encounter: Encounter = {
        ...findEncounter(patientAdmitBundle)!,
        location: [
          { location: { reference: `Location/${METRIPORT_LOCATION_ID}` } },
          { location: { reference: `urn:uuid:${METRIPORT_LOCATION_ID}` } },
        ],
      }

      expect(
        encounterDetailsFrom(patientAdmitBundle, encounter).locations,
      ).toHaveLength(1)
    })
  })
})
