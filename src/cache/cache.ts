export interface CacheService<T> {
  init: () => void | Promise<void>
  destroy: () => void | Promise<void>
  get: (key: string) => T | null | Promise<T | null>
  /**
   * Associates a key with a value
   *
   * @param key key to store the value under
   * @param data value to store
   * @param expires_at optional, Unix timestamp in milliseconds
   */
  set: (key: string, data: T, expires_at?: number) => void | Promise<void>
  unset: (key: string) => void | Promise<void>
}

export abstract class Cache<T> implements CacheService<T> {
  init(): void {}
  destroy(): void {}
  abstract get(key: string): T | null | Promise<T | null>
  /**
   * Associates a key with a value
   *
   * @param key key to store the value under
   * @param data value to store
   * @param expires_at optional, Unix timestamp in milliseconds
   */
  abstract set(key: string, data: T, expires_at?: number): void | Promise<void>
  abstract unset(key: string): void | Promise<void>
}

/**
 * A dummy cache class
 */
export class NoCache extends Cache<any> {
  get(key: string): null { return null }
  set(key: string, data: any): void {}
  unset(key: string): void {}
}
