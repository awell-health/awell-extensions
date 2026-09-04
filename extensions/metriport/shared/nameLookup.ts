import { createHash } from 'crypto'
import { type MetriportMedicalApi } from '@metriport/api-sdk'
import { type settings } from '../settings'

type MetriportSettings = Record<keyof typeof settings, string | undefined>

interface Named {
  id: string
  name: string
}

type Facility = Awaited<
  ReturnType<MetriportMedicalApi['listFacilities']>
>[number]
type Cohort = Awaited<
  ReturnType<MetriportMedicalApi['listCohorts']>
>['cohorts'][number]

/**
 * Metriport has no endpoint to look a Facility or Cohort up by name, so the
 * full list is fetched and matched in memory. Each list is cached per API
 * credential so repeat activities do not re-list on every run.
 */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

/**
 * A name that is not in the cached list may have been created since the list
 * was fetched, so a miss refreshes the list early. The refresh is rate limited
 * so a care flow that keeps passing a bad name cannot re-list on every run.
 */
const MISS_REFRESH_COOLDOWN_MS = 60 * 1000

interface CacheEntry<T> {
  fetchedAt: number
  items: Promise<T[]>
}

class NamedListCache<T extends Named> {
  private readonly entries = new Map<string, CacheEntry<T>>()

  constructor(
    private readonly list: (api: MetriportMedicalApi) => Promise<T[]>,
  ) {}

  async get(key: string, api: MetriportMedicalApi): Promise<T[]> {
    return await this.getOlderThan(key, api, CACHE_TTL_MS)
  }

  /** Refetches the list unless it was fetched within the cooldown. */
  async refreshAfterMiss(key: string, api: MetriportMedicalApi): Promise<T[]> {
    return await this.getOlderThan(key, api, MISS_REFRESH_COOLDOWN_MS)
  }

  private async getOlderThan(
    key: string,
    api: MetriportMedicalApi,
    maxAgeMs: number,
  ): Promise<T[]> {
    const cached = this.entries.get(key)
    if (cached !== undefined && Date.now() - cached.fetchedAt < maxAgeMs) {
      return await cached.items
    }

    return await this.refresh(key, api)
  }

  /**
   * The pending promise is cached rather than its result so concurrent
   * lookups on a cold cache share one request instead of each listing.
   */
  private async refresh(key: string, api: MetriportMedicalApi): Promise<T[]> {
    const items = this.list(api)
    const entry = { fetchedAt: Date.now(), items }
    this.entries.set(key, entry)

    try {
      return await items
    } catch (err) {
      // A failed request must not be served for the next 24 hours.
      if (this.entries.get(key) === entry) this.entries.delete(key)
      throw err
    }
  }

  clear(): void {
    this.entries.clear()
  }
}

const facilities = new NamedListCache<Facility>(
  async (api) => await api.listFacilities(),
)
const cohorts = new NamedListCache<Cohort>(
  async (api) => (await api.listCohorts()).cohorts,
)

/**
 * The cache is keyed by credential so tenants (and sandbox vs. production for
 * the same tenant) never see each other's lists. The key is hashed so the raw
 * API key is not held as a Map key.
 */
const cacheKey = (settings: MetriportSettings): string =>
  createHash('sha256')
    .update(`${settings.apiKey ?? ''}|${settings.baseUrl ?? ''}`)
    .digest('hex')

const normalise = (name: string): string => name.trim().toLowerCase()

/**
 * Raised when a name does not identify exactly one Facility or Cohort. This
 * is a problem with the care flow's input rather than with Metriport, so the
 * error handler reports it as `WRONG_INPUT`.
 */
export class NameLookupError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NameLookupError'
  }
}

const findByName = async <T extends Named>(
  cache: NamedListCache<T>,
  kind: { singular: string; plural: string },
  api: MetriportMedicalApi,
  settings: MetriportSettings,
  name: string,
): Promise<T> => {
  const key = cacheKey(settings)
  const target = normalise(name)
  const matching = (items: T[]): T[] =>
    items.filter((item) => normalise(item.name) === target)

  let matches = matching(await cache.get(key, api))

  if (matches.length === 0) {
    matches = matching(await cache.refreshAfterMiss(key, api))
  }

  if (matches.length === 0) {
    throw new NameLookupError(
      `No ${kind.singular} found with the name "${name}"`,
    )
  }

  if (matches.length > 1) {
    throw new NameLookupError(
      `${matches.length} ${kind.plural} found with the name "${name}". The name must identify exactly one ${kind.singular}.`,
    )
  }

  return matches[0]
}

export const findFacilityByName = async (
  api: MetriportMedicalApi,
  settings: MetriportSettings,
  name: string,
): Promise<Facility> =>
  await findByName(
    facilities,
    { singular: 'Facility', plural: 'Facilities' },
    api,
    settings,
    name,
  )

export const findCohortByName = async (
  api: MetriportMedicalApi,
  settings: MetriportSettings,
  name: string,
): Promise<Cohort> =>
  await findByName(
    cohorts,
    { singular: 'Cohort', plural: 'Cohorts' },
    api,
    settings,
    name,
  )

/** Test-only: drops every cached list. */
export const clearNameLookupCache = (): void => {
  facilities.clear()
  cohorts.clear()
}
