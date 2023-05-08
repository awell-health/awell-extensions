import { Cache } from '../cache'

import { createClient, type RedisClientType } from 'redis'

export class RedisCache extends Cache<string> {
  private readonly client: RedisClientType

  constructor({ client }: { client?: RedisClientType }) {
    super()
    this.client = client ?? createClient()
  }

  async init(): Promise<void> {
    await this.client.connect()
  }

  async destroy(): Promise<void> {
    await this.client.disconnect()
  }

  async set(key: string, data: string, expiresAt?: number): Promise<void> {
    const options = expiresAt !== undefined ? { PXAT: expiresAt } : undefined
    // I'm using SET instead of HSET, as we only need a single value associated with a key, and SET allows for automatic expiration
    await this.client.SET(key, data, options)
  }

  async get(key: string): Promise<string | null> {
    const ttl = await this.client.TTL(key)

    // If the key does not exist TTL will be -2
    if (ttl === -2) {
      return null
    }

    return await this.client.GET(key)
  }

  async unset(key: string): Promise<void> {
    await this.client.UNLINK(key)
  }
}
