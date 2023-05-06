export interface CacheService<T> {
  get: (key: string) => T | null | Promise<T | null>;
  /**
   * Associates a key with a value
   *
   * @param key key to store the value under
   * @param data value to store
   * @param expires_at optional, Unix timestamp in milliseconds
   */
  set: (key: string, data: T, expires_at?: number) => void | Promise<void>;
  unset: (key: string) => void | Promise<void>;
}

/**
 * A dummy cache class
 */
export class NoCache implements CacheService<any> {
  get(key: string): null { return null }
  set(key: string, data: any): void {}
  unset(key: string): void {}
}
