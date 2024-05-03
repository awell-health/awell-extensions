import { cache } from '@awell-health/extensions-core'

/**
 * A cache service can be used in combination with the OAuth API client
 * to automatically cache tokens between requests.
 * The only cache implementation available is a simple in-memory cache,
 * so it has to be initialised as a singleton to preserve the data across
 * the lifecycle of the server running your extension.
 * Note that we will soon be releasing another implementation of the cache
 * service that will remove this restriction.
 */
export const dockCacheService = new cache.InMemoryCache()
