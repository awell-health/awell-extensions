import type { CacheService } from './cache/cache'

export interface Services {
  authCacheService: CacheService<string>
}
