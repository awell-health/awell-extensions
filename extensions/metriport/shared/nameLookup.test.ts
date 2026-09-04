import { type MetriportMedicalApi } from '@metriport/api-sdk'
import {
  clearNameLookupCache,
  findCohortByName,
  findFacilityByName,
  NameLookupError,
} from './nameLookup'

const settings = {
  apiKey: 'test-api-key',
  baseUrl: '',
  webhookKey: '',
  rateLimitDuration: '',
}

const facility = (id: string, name: string): { id: string; name: string } => ({
  id,
  name,
})

describe('nameLookup', () => {
  const listFacilities = jest.fn()
  const listCohorts = jest.fn()
  const api = { listFacilities, listCohorts } as unknown as MetriportMedicalApi

  beforeEach(() => {
    jest.clearAllMocks()
    clearNameLookupCache()
  })

  describe('findFacilityByName', () => {
    test('returns the facility whose name matches, ignoring case and surrounding whitespace', async () => {
      listFacilities.mockResolvedValue([
        facility('facility-0', 'Other Clinic'),
        facility('facility-1', ' Awell Clinic '),
      ])

      const result = await findFacilityByName(api, settings, 'awell clinic')

      expect(result.id).toBe('facility-1')
    })

    test('serves repeat lookups from the cache without calling the API again', async () => {
      listFacilities.mockResolvedValue([facility('facility-1', 'Awell Clinic')])

      await findFacilityByName(api, settings, 'Awell Clinic')
      await findFacilityByName(api, settings, 'Awell Clinic')

      expect(listFacilities).toHaveBeenCalledTimes(1)
    })

    test('refetches the list once the 24 hour cache has expired', async () => {
      jest.useFakeTimers()
      try {
        jest.setSystemTime(new Date('2026-09-04T10:00:00Z'))
        listFacilities.mockResolvedValue([
          facility('facility-1', 'Awell Clinic'),
        ])

        await findFacilityByName(api, settings, 'Awell Clinic')

        jest.setSystemTime(new Date('2026-09-05T09:59:59Z'))
        await findFacilityByName(api, settings, 'Awell Clinic')
        expect(listFacilities).toHaveBeenCalledTimes(1)

        jest.setSystemTime(new Date('2026-09-05T10:00:01Z'))
        await findFacilityByName(api, settings, 'Awell Clinic')
        expect(listFacilities).toHaveBeenCalledTimes(2)
      } finally {
        jest.useRealTimers()
      }
    })

    test('keeps a separate cache per API key and base URL', async () => {
      listFacilities.mockResolvedValue([facility('facility-1', 'Awell Clinic')])

      await findFacilityByName(api, settings, 'Awell Clinic')
      await findFacilityByName(
        api,
        { ...settings, apiKey: 'other-tenant-key' },
        'Awell Clinic',
      )
      await findFacilityByName(
        api,
        { ...settings, baseUrl: 'https://api.metriport.com' },
        'Awell Clinic',
      )

      expect(listFacilities).toHaveBeenCalledTimes(3)
    })

    test('refreshes a cached list older than a minute when the name is not in it, so a newly created facility is found', async () => {
      jest.useFakeTimers()
      try {
        jest.setSystemTime(new Date('2026-09-04T10:00:00Z'))
        listFacilities
          .mockResolvedValueOnce([facility('facility-1', 'Awell Clinic')])
          .mockResolvedValueOnce([
            facility('facility-1', 'Awell Clinic'),
            facility('facility-2', 'New Clinic'),
          ])

        await findFacilityByName(api, settings, 'Awell Clinic')

        jest.setSystemTime(new Date('2026-09-04T10:01:00Z'))
        const result = await findFacilityByName(api, settings, 'New Clinic')

        expect(result.id).toBe('facility-2')
        expect(listFacilities).toHaveBeenCalledTimes(2)
      } finally {
        jest.useRealTimers()
      }
    })

    test('does not refresh a list fetched less than a minute ago, so a care flow with a bad name cannot hammer the API', async () => {
      listFacilities.mockResolvedValue([facility('facility-1', 'Awell Clinic')])

      await expect(
        findFacilityByName(api, settings, 'Missing Clinic'),
      ).rejects.toThrow(NameLookupError)
      await expect(
        findFacilityByName(api, settings, 'Missing Clinic'),
      ).rejects.toThrow(NameLookupError)

      expect(listFacilities).toHaveBeenCalledTimes(1)
    })

    test('throws a NameLookupError naming the facility when nothing matches even after a refresh', async () => {
      jest.useFakeTimers()
      try {
        jest.setSystemTime(new Date('2026-09-04T10:00:00Z'))
        listFacilities.mockResolvedValue([
          facility('facility-1', 'Awell Clinic'),
        ])

        await findFacilityByName(api, settings, 'Awell Clinic')
        jest.setSystemTime(new Date('2026-09-04T10:01:00Z'))

        await expect(
          findFacilityByName(api, settings, 'Missing Clinic'),
        ).rejects.toThrow(
          new NameLookupError(
            'No Facility found with the name "Missing Clinic"',
          ),
        )
        expect(listFacilities).toHaveBeenCalledTimes(2)
      } finally {
        jest.useRealTimers()
      }
    })

    test('throws a NameLookupError when more than one facility shares the name', async () => {
      listFacilities.mockResolvedValue([
        facility('facility-1', 'Awell Clinic'),
        facility('facility-2', 'awell clinic'),
      ])

      await expect(
        findFacilityByName(api, settings, 'Awell Clinic'),
      ).rejects.toThrow(
        new NameLookupError(
          '2 Facilities found with the name "Awell Clinic". The name must identify exactly one Facility.',
        ),
      )
    })

    test('shares a single in-flight request between concurrent lookups on a cold cache', async () => {
      listFacilities.mockResolvedValue([facility('facility-1', 'Awell Clinic')])

      await Promise.all([
        findFacilityByName(api, settings, 'Awell Clinic'),
        findFacilityByName(api, settings, 'Awell Clinic'),
      ])

      expect(listFacilities).toHaveBeenCalledTimes(1)
    })

    test('does not cache a failed list request, so the next lookup retries', async () => {
      listFacilities
        .mockRejectedValueOnce(new Error('Metriport is down'))
        .mockResolvedValue([facility('facility-1', 'Awell Clinic')])

      await expect(
        findFacilityByName(api, settings, 'Awell Clinic'),
      ).rejects.toThrow('Metriport is down')

      const result = await findFacilityByName(api, settings, 'Awell Clinic')

      expect(result.id).toBe('facility-1')
    })
  })

  describe('findCohortByName', () => {
    test('returns the cohort whose name matches from the cohorts list', async () => {
      listCohorts.mockResolvedValue({
        cohorts: [
          facility('cohort-0', 'Other Clinic'),
          facility('cohort-1', 'Awell Clinic'),
        ],
      })

      const result = await findCohortByName(api, settings, 'Awell Clinic')

      expect(result.id).toBe('cohort-1')
    })
  })
})
