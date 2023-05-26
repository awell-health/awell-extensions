import type { CacheService } from '@awell-health/awell-extensions-types'

/**
 * A dummy cache class
 */
export class NoCache implements CacheService<any> {
  async init(): Promise<void> {}
  async destroy(): Promise<void> {}
  get(key: string): null {
    return null
  }

  set(key: string, data: any): void {}
  unset(key: string): void {}
}
