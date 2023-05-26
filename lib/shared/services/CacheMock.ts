import type { CacheService } from '@awell-health/awell-extensions-types'

export class CacheMock implements CacheService<string> {
  async init(): Promise<void> {}
  async destroy(): Promise<void> {}

  private readonly storage: Map<string, { value: string; expiresAt?: number }> =
    new Map<string, { value: string; expiresAt?: number }>()

  async set(key: string, data: string, expiresAt?: number): Promise<void> {
    this.storage.set(key, { value: data, expiresAt })
  }

  async get(key: string): Promise<string | null> {
    const result = this.storage.get(key)

    if (result == null) {
      return null
    }

    if (result.expiresAt != null && result.expiresAt < Date.now()) {
      this.storage.delete(key)
      return null
    }

    return result.value
  }

  async unset(key: string): Promise<void> {
    this.storage.delete(key)
  }
}
