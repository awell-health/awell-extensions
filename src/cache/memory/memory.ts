import { type CacheService } from '../cache'
import { LRU } from './lru'

interface CacheElement<T> {
  value: T
  expiresAt?: number
}

export class InMemoryCache implements CacheService<string> {
  private readonly maxEntries: number
  private readonly lru: LRU<CacheElement<string>>

  constructor({ maxEntries }: { maxEntries?: number }) {
    this.maxEntries = maxEntries ?? -1
    this.lru = new LRU<CacheElement<string>>(this.maxEntries)
  }

  set(key: string, data: string, expiresAt?: number): void {
    this.lru.set(key, { value: data, expiresAt })
  }

  get(key: string): string | null {
    const result = this.lru.get(key)

    if (result == null) {
      return null
    }

    // Delete key if expired
    if (result.expiresAt != null && result.expiresAt < Date.now()) {
      this.lru.delete(key)
      return null
    }

    return result.value
  }

  unset(key: string): void {
    this.lru.delete(key)
  }
}
