import { RedisCache } from '../redis'
import { createClient } from 'redis'
import { GenericContainer, type StartedTestContainer } from 'testcontainers'
import { type CacheService } from '../../cache'

jest.unmock('redis')

// Set a longer timeout since we need to pull redis image
jest.setTimeout(120 * 1000)

describe('Redis token cache', () => {
  const key = 'test-key'
  const value = 'test-value'

  let cache: CacheService<string>
  let container: StartedTestContainer

  beforeAll(async () => {
    // Spin up a test redis instance
    container = await new GenericContainer('redis')
      .withExposedPorts(6379)
      .start()

    cache = new RedisCache({
      client: createClient({
        socket: {
          port: container.getMappedPort(6379),
          host: container.getHost(),
        },
      }),
    })

    await cache.init()
  })

  afterAll(async () => {
    await container.stop()
  })

  test('Should save and retrieve a value', async () => {
    await cache.set(key, value)

    const result = await cache.get(key)
    expect(result).toEqual(value)
  })

  test('Should properly unset keys', async () => {
    await cache.set(key, value)

    const result = await cache.get(key)
    expect(result).toEqual(value)

    await cache.unset(key)
    const secondResult = await cache.get(key)
    expect(secondResult).toBeNull()
  })

  test('Should properly expire keys', async () => {
    await cache.set(key, value, Date.now() + 2000)

    const result = await cache.get(key)
    expect(result).toEqual(value)

    await new Promise((resolve) => setTimeout(resolve, 3000))
    const secondResult = await cache.get(key)
    expect(secondResult).toBeNull()
  })
})
